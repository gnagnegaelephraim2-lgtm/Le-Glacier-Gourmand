import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
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
  'GL-4444': 'Malheureusement, cette commande a été annulée. Veuillez contacter notre support.',
  'GL-5555': "Votre commande est en transit vers la région de Grand Baie. Elle devrait arriver d'ici une heure.",
  'GL-7777': "Votre commande est en cours d'emballage dans nos boîtes de luxe à température contrôlée.",
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
  const { message, language = 'fr', history = [], userName } = req.body as {
    message: string;
    language?: string;
    history?: HistoryItem[];
    userName?: string;
  };

  if (!message) {
    res.status(400).json({ error: 'Message requis.' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Clé API Anthropic non configurée.' });
    return;
  }

  const client = new Anthropic({ apiKey });
  const langName = LANGUAGE_NAMES[language] || 'Français';
  const userGreeting = userName ? `The customer's name is ${userName}. Address them by name warmly.` : '';

  const systemPrompt = `You are Chrys, the elegant AI concierge for 'Le Glacier Gourmand', an artisan ice cream boutique in Beau Plan, Mauritius. You are charming, warm and an expert in artisan ice creams, local Mauritian tropical fruits, and the boutique's menu. You help customers with their questions and can track their orders.

${userGreeting}

IMPORTANT: Always respond exclusively in ${langName}. Keep responses concise, warm and sophisticated. Sign off as Chrys when appropriate.`;

  try {
    // Build message history (Claude uses 'assistant' not 'model')
    const messages: Anthropic.MessageParam[] = [
      ...history.map(m => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      })),
      { role: 'user' as const, content: message },
    ];

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages,
      tools: [{
        name: 'trackOrder',
        description: 'Get the current status of an ice cream order using its Order ID.',
        input_schema: {
          type: 'object' as const,
          properties: {
            orderId: {
              type: 'string',
              description: 'The Order ID (e.g., GL-1234).',
            },
          },
          required: ['orderId'],
        },
      }],
    });

    // Handle tool use
    if (response.stop_reason === 'tool_use') {
      const toolUse = response.content.find(b => b.type === 'tool_use') as Anthropic.ToolUseBlock;
      if (toolUse?.name === 'trackOrder') {
        const orderId = (toolUse.input as { orderId: string }).orderId;
        const status = MOCK_ORDERS[orderId] ||
          "Je n'ai pas trouvé de commande avec cet identifiant. Veuillez vérifier qu'il suit le format GL-XXXX.";

        const followUp = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: systemPrompt,
          messages: [
            ...messages,
            { role: 'assistant' as const, content: response.content },
            {
              role: 'user' as const,
              content: [{
                type: 'tool_result' as const,
                tool_use_id: toolUse.id,
                content: status,
              }],
            },
          ],
        });

        const text = followUp.content.find(b => b.type === 'text') as Anthropic.TextBlock | undefined;
        res.json({ text: text?.text || status });
        return;
      }
    }

    const textBlock = response.content.find(b => b.type === 'text') as Anthropic.TextBlock | undefined;
    res.json({ text: textBlock?.text || "Je suis momentanément indisponible. Venez nous rendre visite à Beau Plan !" });

  } catch (error) {
    console.error('Anthropic API error:', error);
    res.status(500).json({ error: "Erreur de connexion à l'assistante." });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Serveur Glacier Gourmand (Chrys - Claude) démarré sur le port ${PORT}`);
});
