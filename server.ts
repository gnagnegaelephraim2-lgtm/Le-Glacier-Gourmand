import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(express.json());

const MOCK_ORDERS: Record<string, string> = {
  'GL-1234': 'Votre commande est en cours de préparation avec des mangues fraîches de Maurice.',
  'GL-5678': 'Votre commande est en cours de livraison dans la région de Beau Plan.',
  'GL-9012': 'Votre commande a été livrée. Savourez votre gelato artisanal !',
  'GL-0000': 'Numéro de commande introuvable. Veuillez vérifier votre reçu.',
  'GL-1111': 'Commande reçue et confirmée. Nos artisans vont commencer la préparation sous peu.',
  'GL-2222': 'Votre commande a un léger retard dû à un grand nombre de demandes artisanales. Merci de votre patience !',
  'GL-3333': 'Votre commande est prête à être récupérée dans notre boutique de Beau Plan. À bientôt !',
  'GL-4444': 'Malheureusement, cette commande a été annulée. Veuillez contacter notre support pour plus de détails.',
  'GL-5555': "Votre commande est en transit vers la région de Grand Baie. Elle devrait arriver d'ici une heure.",
  'GL-7777': "Votre commande est en cours d'emballage dans nos boîtes de luxe spéciales à température contrôlée.",
};

const trackOrderTool = {
  name: 'trackOrder',
  parameters: {
    type: Type.OBJECT,
    description: 'Get the current status of an ice cream order using its Order ID.',
    properties: {
      orderId: {
        type: Type.STRING,
        description: 'The Order ID (e.g., GL-1234).',
      },
    },
    required: ['orderId'],
  },
};

const LANGUAGE_NAMES: Record<string, string> = {
  fr: 'Français',
  en: 'English',
  cr: 'Kreol Morisyen',
  ar: 'العربية',
  hi: 'हिंदी',
  zh: '中文 (Mandarin)',
};

type HistoryItem = { role: 'user' | 'ai'; text: string };

app.post('/api/chat', async (req, res) => {
  const { message, language = 'fr', history = [] } = req.body as {
    message: string;
    language?: string;
    history?: HistoryItem[];
  };

  if (!message) {
    res.status(400).json({ error: 'Message requis.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Clé API Gemini non configurée.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const langName = LANGUAGE_NAMES[language] || 'French';

    // Build multi-turn conversation contents
    const contents = [
      ...history.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction: `You are a luxury concierge for 'Le Glacier Gourmand', an artisan ice cream boutique in Beau Plan, Mauritius. You are elegant, helpful and an expert in ice creams, local Mauritian fruits and the boutique's menu. You also help users track their orders via the trackOrder tool.

IMPORTANT: You MUST respond exclusively in ${langName}. Keep responses concise and sophisticated.`,
        tools: [{ functionDeclarations: [trackOrderTool] }],
      },
    });

    const functionCalls = response.functionCalls;
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === 'trackOrder') {
        const orderId = (call.args as { orderId: string }).orderId;
        const status =
          MOCK_ORDERS[orderId] ||
          "Je n'ai pas trouvé de commande avec cet identifiant. Veuillez vous assurer qu'il suit le format GL-XXXX.";

        const secondResponse = await ai.models.generateContent({
          model: 'gemini-2.0-flash',
          contents: [
            ...contents,
            { role: 'model', parts: [{ functionCall: { name: call.name, args: call.args, id: call.id } }] },
            { role: 'user', parts: [{ functionResponse: { name: call.name, response: { status }, id: call.id } }] },
          ],
          config: {
            systemInstruction: `You are a luxury concierge for 'Le Glacier Gourmand'. You have just retrieved an order status. Present it to the user in an elegant and reassuring manner. Respond exclusively in ${langName}.`,
          },
        });

        res.json({
          text: secondResponse.text || "J'ai récupéré le statut, mais je ne parviens pas à l'afficher. Veuillez réessayer.",
        });
        return;
      }
    }

    res.json({
      text: response.text || "Je m'excuse, je suis momentanément indisponible. Venez nous rendre visite à Beau Plan !",
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ error: "Erreur de connexion à l'assistant." });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Serveur Glacier Gourmand démarré sur le port ${PORT}`);
});
