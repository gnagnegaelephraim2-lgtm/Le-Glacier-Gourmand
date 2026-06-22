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
    `boutique located at Mahogany Shopping Promenade, Beau Plan, Mauritius. ` +
    `You are charming, warm, knowledgeable and always helpful. ` +
    `You know everything about the boutique: its menu, prices, hours, location and policies.\n\n` +
    `${userGreeting}\n\n` +
    `=== OPENING HOURS ===\n` +
    `Monday – Thursday: 08:30 – 18:00\n` +
    `Friday – Saturday (High Season): 08:30 – 20:00\n` +
    `Friday – Saturday (Low Season): 08:30 – 18:00\n` +
    `Sunday: 08:30 – 15:00\n` +
    `Happy Breakfast service: 08:30 – 10:30 every day (order in-store only)\n\n` +
    `=== LOCATION & CONTACT ===\n` +
    `Address: Mahogany Shopping Promenade, Beau Plan, Mauritius\n` +
    `Phone / WhatsApp: +230 5421 7023\n` +
    `Payment accepted: Juice (MauCas) and card\n\n` +
    `=== MENU & PRICES ===\n` +
    `ARTISAN ICE CREAMS (per scoop): Rs 160\n` +
    `Available flavors include: Vanille de Bourbon, Chocolat Noir, Fraise des Champs, ` +
    `Mangue Alphonso, Pitaya Rose Sauvage, Noix de Coco Grillée, Café Glacé, ` +
    `Gianduja, Noisette, Amande, Vanille Praline Noisette (on request), ` +
    `Melon d'eau Fleur d'Oranger (seasonal), Goyave Rouge Cotomilie (seasonal), ` +
    `Douceur Macadamia Coupe, Litchi Rose Sauvage, Papaye Caramélisée & Gingembre, ` +
    `and more seasonal creations.\n\n` +
    `ICE CREAM TAKEAWAY (à emporter):\n` +
    `½ Litre (2 flavors of your choice): Rs 490\n` +
    `1 Litre (3 flavors of your choice): Rs 890\n\n` +
    `HAPPY BREAKFAST (in-store 08:30–10:30, not available to order online):\n` +
    `A gourmet breakfast selection served only in the salon.\n\n` +
    `SIGNATURE WAFFLES (Plats Signature):\n` +
    `Gaufre Saumon & Avocat: Rs 380\n` +
    `Gaufre Champignons Sauvages: Rs 340\n` +
    `Gaufre Omelette & 3 Fromages: Rs 320\n` +
    `Pain Perdu Brioché: Rs 290\n\n` +
    `HOT DRINKS (Café Gourmand / Boisson Chaude):\n` +
    `Espresso, Cappuccino, Café au lait, Thé, Chocolat chaud artisanal and more.\n\n` +
    `FRESH JUICES & DRINKS:\n` +
    `Fresh tropical juices, detox drinks, specialty milkshakes (Pistachio, etc.)\n\n` +
    `=== ESPACE PRO ===\n` +
    `We offer professional services for bulk orders and catering partnerships. ` +
    `Professionals can contact us via WhatsApp +230 5421 7023 for pricing on 4kg bacs and wholesale.\n\n` +
    `=== EVENTS ===\n` +
    `We offer an artisan ice cream cart rental for weddings, corporate events and private parties. ` +
    `Bookings via the website or WhatsApp +230 5421 7023.\n\n` +
    `=== BEHAVIOR RULES ===\n` +
    `- Always respond exclusively in ${langName}.\n` +
    `- Keep responses concise, warm and sophisticated — never robotic.\n` +
    `- If asked about today's hours, give the relevant hours based on the day of the week.\n` +
    `- Never say you don't have access to information that is listed above.\n` +
    `- If a question is truly outside your knowledge (e.g. specific daily specials not listed), ` +
    `invite the customer to call +230 5421 7023 or visit in person.`;

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
