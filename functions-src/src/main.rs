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
        ("GL-4444", "Malheureusement, cette commande a été annulée. Veuillez contacter notre support pour plus de détails."),
        ("GL-5555", "Votre commande est en transit vers la région de Grand Baie. Elle devrait arriver d'ici une heure."),
        ("GL-7777", "Votre commande est en cours d'emballage dans nos boîtes de luxe spéciales à température contrôlée."),
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

// ── Gemini REST helpers ───────────────────────────────────────────────────────

fn track_order_tool() -> Value {
    json!([{
        "functionDeclarations": [{
            "name": "trackOrder",
            "description": "Get the current status of an ice cream order using its Order ID.",
            "parameters": {
                "type": "OBJECT",
                "properties": {
                    "orderId": {
                        "type": "STRING",
                        "description": "The Order ID (e.g., GL-1234)."
                    }
                },
                "required": ["orderId"]
            }
        }]
    }])
}

async fn call_gemini(
    client: &reqwest::Client,
    api_key: &str,
    contents: &[Value],
    system_instruction: &str,
    with_tools: bool,
) -> Result<Value, reqwest::Error> {
    let url = format!(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={}",
        api_key
    );

    let mut body = json!({
        "contents": contents,
        "systemInstruction": {
            "parts": [{ "text": system_instruction }]
        }
    });

    if with_tools {
        body["tools"] = track_order_tool();
    }

    client.post(&url).json(&body).send().await?.json::<Value>().await
}

fn extract_text(res: &Value) -> Option<String> {
    res["candidates"][0]["content"]["parts"]
        .as_array()?
        .iter()
        .find_map(|p| p["text"].as_str().map(String::from))
}

fn extract_function_call(res: &Value) -> Option<(String, Value)> {
    res["candidates"][0]["content"]["parts"]
        .as_array()?
        .iter()
        .find_map(|p| {
            p.get("functionCall").map(|fc| {
                (fc["name"].as_str().unwrap_or("").to_string(), fc["args"].clone())
            })
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
    // CORS preflight
    if event.method() == "OPTIONS" {
        return json_response(200, String::new());
    }

    // Parse body
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

    let api_key = match std::env::var("GEMINI_API_KEY") {
        Ok(k) => k,
        Err(_) => {
            return json_response(500, r#"{"error":"GEMINI_API_KEY non configurée."}"#.to_string())
        }
    };

    let language = req.language.as_deref().unwrap_or("fr");
    let lang_name = language_name(language);

    // Build multi-turn contents (history + current message)
    let mut contents: Vec<Value> = req
        .history
        .unwrap_or_default()
        .into_iter()
        .map(|m| {
            json!({
                "role": if m.role == "user" { "user" } else { "model" },
                "parts": [{ "text": m.text }]
            })
        })
        .collect();

    contents.push(json!({
        "role": "user",
        "parts": [{ "text": req.message }]
    }));

    let system_prompt = format!(
        "You are a luxury concierge for 'Le Glacier Gourmand', an artisan ice cream boutique \
         in Beau Plan, Mauritius. You are elegant, helpful and an expert in ice creams, local \
         Mauritian fruits and the boutique's menu. You also help users track their orders via \
         the trackOrder tool.\n\n\
         IMPORTANT: You MUST respond exclusively in {}. Keep responses concise and sophisticated.",
        lang_name
    );

    let client = reqwest::Client::new();

    let gemini_res = match call_gemini(&client, &api_key, &contents, &system_prompt, true).await {
        Ok(r) => r,
        Err(e) => {
            eprintln!("Gemini API error: {e}");
            return json_response(500, r#"{"error":"Erreur Gemini API."}"#.to_string());
        }
    };

    // Handle trackOrder function call
    let reply = if let Some((fn_name, fn_args)) = extract_function_call(&gemini_res) {
        if fn_name == "trackOrder" {
            let order_id = fn_args["orderId"].as_str().unwrap_or("");
            let orders = mock_orders();
            let status = orders.get(order_id).copied().unwrap_or(
                "Je n'ai pas trouvé de commande avec cet identifiant. \
                 Veuillez vous assurer qu'il suit le format GL-XXXX.",
            );

            // Second turn: inject the function result back into the conversation
            let mut contents2 = contents.clone();
            contents2.push(json!({
                "role": "model",
                "parts": [{ "functionCall": { "name": &fn_name, "args": &fn_args } }]
            }));
            contents2.push(json!({
                "role": "user",
                "parts": [{ "functionResponse": {
                    "name": &fn_name,
                    "response": { "status": status }
                }}]
            }));

            let system2 = format!(
                "You are a luxury concierge for 'Le Glacier Gourmand'. You have just retrieved \
                 an order status. Present it elegantly and reassuringly. \
                 Respond exclusively in {}.",
                lang_name
            );

            match call_gemini(&client, &api_key, &contents2, &system2, false).await {
                Ok(r) => extract_text(&r)
                    .unwrap_or_else(|| "Je ne parviens pas à afficher le statut. Veuillez réessayer.".to_string()),
                Err(_) => "Une erreur est survenue lors de la récupération du statut.".to_string(),
            }
        } else {
            extract_text(&gemini_res)
                .unwrap_or_else(|| "Je m'excuse, je suis momentanément indisponible.".to_string())
        }
    } else {
        extract_text(&gemini_res).unwrap_or_else(|| {
            "Je m'excuse, je suis momentanément indisponible. Venez nous rendre visite à Beau Plan !".to_string()
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
