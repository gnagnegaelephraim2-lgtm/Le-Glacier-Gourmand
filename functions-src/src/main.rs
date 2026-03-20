use lambda_http::{run, service_fn, Body, Error, Request, Response};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::HashMap;

// ── Mock order data ───────────────────────────────────────────────────────────

fn mock_orders() -> HashMap<&'static str, &'static str> {
    HashMap::from([
        ("GL-1234", "Votre commande est en cours de préparation avec des mangues fraîches de Maurice."),
        ("GL-5678", "Votre commande est en cours de livraison dans la région de Beau Plan."),
        ("GL-9012", "Votre commande a été livrée. Savourez votre gelato artisanal !"),
        ("GL-0000", "Numéro de commande introuvable. Veuillez vérifier votre reçu."),
        ("GL-1111", "Commande reçue et confirmée. Nos artisans vont commencer la préparation sous peu."),
        ("GL-2222", "Votre commande a un léger retard dû à un grand nombre de demandes artisanales. Merci de votre patience !"),
        ("GL-3333", "Votre commande est prête à être récupérée dans notre boutique de Beau Plan. À bientôt !"),
        ("GL-4444", "Malheureusement, cette commande a été annulée. Veuillez contacter notre support."),
        ("GL-5555", "Votre commande est en transit vers la région de Grand Baie. Elle devrait arriver d'ici une heure."),
        ("GL-7777", "Votre commande est en cours d'emballage dans nos boîtes de luxe à température contrôlée."),
    ])
}

fn language_name(code: &str) -> &'static str {
    match code {
        "fr" => "Français",
        "en" => "English",
        "cr" => "Kreol Morisyen",
        "ar" => "العربية",
        "hi" => "हिंदी",
        "zh" => "中文 (Mandarin)",
        _ => "Français",
    }
}

// ── Request / Response types ──────────────────────────────────────────────────

#[derive(Deserialize)]
struct ChatRequest {
    message: String,
    language: Option<String>,
    history: Option<Vec<HistoryItem>>,
    #[serde(rename = "userName")]
    user_name: Option<String>,
}

#[derive(Deserialize, Serialize)]
struct HistoryItem {
    role: String,
    text: String,
}

#[derive(Serialize)]
struct ChatResponse {
    text: String,
}

// ── Claude REST helpers ───────────────────────────────────────────────────────

fn track_order_tool() -> Value {
    json!([{
        "name": "trackOrder",
        "description": "Get the current status of an ice cream order using its Order ID.",
        "input_schema": {
            "type": "object",
            "properties": {
                "orderId": {
                    "type": "string",
                    "description": "The Order ID (e.g., GL-1234)."
                }
            },
            "required": ["orderId"]
        }
    }])
}

async fn call_claude(
    client: &reqwest::Client,
    api_key: &str,
    system: &str,
    messages: &[Value],
    with_tools: bool,
) -> Result<Value, reqwest::Error> {
    let mut body = json!({
        "model": "claude-haiku-4-5-20251001",
        "max_tokens": 512,
        "system": system,
        "messages": messages
    });

    if with_tools {
        body["tools"] = track_order_tool();
    }

    client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&body)
        .send()
        .await?
        .json::<Value>()
        .await
}

fn extract_text(res: &Value) -> Option<String> {
    res["content"]
        .as_array()?
        .iter()
        .find_map(|b| {
            if b["type"].as_str() == Some("text") {
                b["text"].as_str().map(String::from)
            } else {
                None
            }
        })
}

fn extract_tool_use(res: &Value) -> Option<(String, String, Value)> {
    res["content"].as_array()?.iter().find_map(|b| {
        if b["type"].as_str() == Some("tool_use") {
            let name = b["name"].as_str()?.to_string();
            let id = b["id"].as_str()?.to_string();
            let input = b["input"].clone();
            Some((name, id, input))
        } else {
            None
        }
    })
}

// ── Response builder with CORS ────────────────────────────────────────────────

fn json_response(status: u16, body: String) -> Result<Response<Body>, Error> {
    Ok(Response::builder()
        .status(status)
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Headers", "Content-Type")
        .header("Access-Control-Allow-Methods", "POST, OPTIONS")
        .header("Content-Type", "application/json")
        .body(Body::Text(body))?)
}

// ── Lambda handler ────────────────────────────────────────────────────────────

async fn handler(event: Request) -> Result<Response<Body>, Error> {
    if event.method() == "OPTIONS" {
        return json_response(200, String::new());
    }

    let body_str = match event.body() {
        Body::Text(s) => s.as_str(),
        Body::Binary(b) => std::str::from_utf8(b).unwrap_or("{}"),
        Body::Empty => "{}",
    };

    let req: ChatRequest = match serde_json::from_str(body_str) {
        Ok(r) => r,
        Err(_) => return json_response(400, r#"{"error":"Corps de requête invalide."}"#.to_string()),
    };

    if req.message.trim().is_empty() {
        return json_response(400, r#"{"error":"Message requis."}"#.to_string());
    }

    let api_key = match std::env::var("ANTHROPIC_API_KEY") {
        Ok(k) => k,
        Err(_) => {
            return json_response(500, r#"{"error":"ANTHROPIC_API_KEY non configurée."}"#.to_string())
        }
    };

    let language = req.language.as_deref().unwrap_or("fr");
    let lang_name = language_name(language);
    let user_greeting = req
        .user_name
        .as_deref()
        .map(|n| format!("The customer's name is {}. Address them by name warmly.", n))
        .unwrap_or_default();

    let system_prompt = format!(
        "You are Chrys, the elegant AI concierge for 'Le Glacier Gourmand', an artisan ice cream \
         boutique in Beau Plan, Mauritius. You are charming, warm and an expert in artisan ice creams, \
         local Mauritian tropical fruits, and the boutique's menu. You help customers with questions \
         and can track their orders.\n\n\
         {}\n\n\
         IMPORTANT: Always respond exclusively in {}. Keep responses concise, warm and sophisticated.",
        user_greeting, lang_name
    );

    // Build Claude messages (history uses 'assistant' not 'model')
    let mut messages: Vec<Value> = req
        .history
        .unwrap_or_default()
        .into_iter()
        .map(|m| {
            json!({
                "role": if m.role == "user" { "user" } else { "assistant" },
                "content": m.text
            })
        })
        .collect();

    messages.push(json!({ "role": "user", "content": req.message }));

    let client = reqwest::Client::new();

    let claude_res = match call_claude(&client, &api_key, &system_prompt, &messages, true).await {
        Ok(r) => r,
        Err(e) => {
            eprintln!("Claude API error: {e}");
            return json_response(500, r#"{"error":"Erreur Claude API."}"#.to_string());
        }
    };

    // Handle tool_use (trackOrder)
    let reply = if let Some((fn_name, tool_use_id, fn_input)) = extract_tool_use(&claude_res) {
        if fn_name == "trackOrder" {
            let order_id = fn_input["orderId"].as_str().unwrap_or("");
            let orders = mock_orders();
            let status = orders.get(order_id).copied().unwrap_or(
                "Je n'ai pas trouvé de commande avec cet identifiant. \
                 Veuillez vous assurer qu'il suit le format GL-XXXX.",
            );

            // Second turn with tool result
            let mut messages2 = messages.clone();
            messages2.push(json!({
                "role": "assistant",
                "content": claude_res["content"]
            }));
            messages2.push(json!({
                "role": "user",
                "content": [{
                    "type": "tool_result",
                    "tool_use_id": tool_use_id,
                    "content": status
                }]
            }));

            match call_claude(&client, &api_key, &system_prompt, &messages2, false).await {
                Ok(r) => extract_text(&r)
                    .unwrap_or_else(|| status.to_string()),
                Err(_) => status.to_string(),
            }
        } else {
            extract_text(&claude_res)
                .unwrap_or_else(|| "Je suis momentanément indisponible.".to_string())
        }
    } else {
        extract_text(&claude_res).unwrap_or_else(|| {
            "Je suis momentanément indisponible. Venez nous rendre visite à Beau Plan !".to_string()
        })
    };

    let body = serde_json::to_string(&ChatResponse { text: reply })?;
    json_response(200, body)
}

// ── Entry point ───────────────────────────────────────────────────────────────

#[tokio::main]
async fn main() -> Result<(), Error> {
    run(service_fn(handler)).await
}
