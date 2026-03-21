import Anthropic from '@anthropic-ai/sdk';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const MOCK_ORDERS = {
  'GL-1234': 'Votre commande est en cours de préparation avec des mangues fraîches de Maurice.',
  'GL-5678': 'Votre commande est en cours de livraison dans la région de Beau Plan.',
  'GL-9012': "Votre commande a été livrée. Savourez votre gelato artisanal !",
  'GL-0000': 'Numéro de commande introuvable. Veuillez vérifier votre reçu.',
  'GL-1111': 'Commande reçue et confirmée. Nos artisans vont commencer la préparation sous peu.',
  'GL-2222': "Votre commande a un léger retard dû à un grand nombre de demandes artisanales. Merci de votre patience !",
  'GL-3333': 'Votre commande est prête à être récupérée dans notre boutique de Beau Plan. À bientôt !',
  'GL-4444': 'Malheureusement, cette commande a été annulée. Veuillez contacter notre support.',
  'GL-5555': "Votre commande est en transit vers la région de Grand Baie. Elle devrait arriver d'ici une heure.",
  'GL-7777': 'Votre commande est en cours d\'emballage dans nos boîtes de luxe à température contrôlée.',
};

const LANGUAGE_NAMES = {
  fr: 'Français',
  en: 'English',
  cr: 'Kreol Morisyen',
  ar: 'العربية',
  hi: 'हिंदी',
  zh: '中文 (Mandarin)',
};

function json(statusCode, body) {
  return { statusCode, headers: CORS_HEADERS, body: JSON.stringify(body) };
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  let req;
  try {
    req = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Corps de requête invalide.' });
  }

  if (!req.message?.trim()) {
    return json(400, { error: 'Message requis.' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(500, { error: 'ANTHROPIC_API_KEY non configurée.' });
  }

  const language = req.language || 'fr';
  const langName = LANGUAGE_NAMES[language] || 'Français';
  const userGreeting = req.userName
    ? `The customer's name is ${req.userName}. Address them by name warmly.`
    : '';

  const systemPrompt =
    `You are Chrys, the elegant AI concierge for 'Le Glacier Gourmand', an artisan ice cream ` +
    `boutique in Beau Plan, Mauritius. You are charming, warm and an expert in artisan ice creams, ` +
    `local Mauritian tropical fruits, and the boutique's menu. You help customers with questions ` +
    `and can track their orders.\n\n` +
    `${userGreeting}\n\n` +
    `IMPORTANT: Always respond exclusively in ${langName}. Keep responses concise, warm and sophisticated.`;

  const history = (req.history || []).map((m) => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.text,
  }));

  const messages = [...history, { role: 'user', content: req.message }];

  const client = new Anthropic({ apiKey });

  try {
    // First turn — with trackOrder tool
    const firstRes = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      tools: [{
        name: 'trackOrder',
        description: 'Get the current status of an ice cream order using its Order ID.',
        input_schema: {
          type: 'object',
          properties: {
            orderId: { type: 'string', description: 'The Order ID (e.g., GL-1234).' },
          },
          required: ['orderId'],
        },
      }],
      messages,
    });

    const toolUse = firstRes.content.find((b) => b.type === 'tool_use');

    if (toolUse && toolUse.name === 'trackOrder') {
      const orderId = toolUse.input.orderId;
      const status = MOCK_ORDERS[orderId] ||
        'Je n\'ai pas trouvé de commande avec cet identifiant. Veuillez vous assurer qu\'il suit le format GL-XXXX.';

      // Second turn — with tool result
      const secondRes = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        system: systemPrompt,
        messages: [
          ...messages,
          { role: 'assistant', content: firstRes.content },
          { role: 'user', content: [{ type: 'tool_result', tool_use_id: toolUse.id, content: status }] },
        ],
      });

      const text = secondRes.content.find((b) => b.type === 'text')?.text || status;
      return json(200, { text });
    }

    const text = firstRes.content.find((b) => b.type === 'text')?.text ||
      'Je suis momentanément indisponible. Venez nous rendre visite à Beau Plan !';
    return json(200, { text });

  } catch (err) {
    console.error('Claude API error:', err);
    return json(500, { error: 'Erreur Claude API.' });
  }
};
