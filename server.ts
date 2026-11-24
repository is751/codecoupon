import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, type Content } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const ALLOWED_MODELS = new Set(['gemini-4-hydrogen', 'gemini-3.1-flash-lite']);

interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    const err = new Error(
      'Gemini API key is not configured on the server. Please add GEMINI_API_KEY in Settings > Secrets.'
    ) as Error & { status?: number };
    err.status = 503;
    throw err;
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/chat', async (req: Request, res: Response) => {
    try {
      const { message, history, model, catalogContext } = req.body ?? {};

      if (typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ error: 'Message must be a non-empty string.' });
      }

      const trimmedMessage = message.trim().slice(0, 4000);
      const selectedModel =
        typeof model === 'string' && ALLOWED_MODELS.has(model)
          ? model
          : 'gemini-4-hydrogen';

      const sanitizedHistory: ChatHistoryItem[] = Array.isArray(history)
        ? history
            .filter(
              (item): item is ChatHistoryItem =>
                Boolean(item) &&
                (item.role === 'user' || item.role === 'model') &&
                typeof item.text === 'string' &&
                item.text.trim().length > 0
            )
            .slice(-30)
            .map((item) => ({
              role: item.role,
              text: item.text.trim().slice(0, 8000),
            }))
        : [];

      const safeContext =
        typeof catalogContext === 'string' && catalogContext.trim()
          ? catalogContext.trim().slice(0, 10000)
          : '';

      const systemInstruction = [
        'You are the CodeCoupon Savings Assistant, a knowledgeable and friendly shopping deals and promo code advisor for CodeCoupon.',
        'Help shoppers discover verified promo codes, compare store discounts, understand coupon expiration dates and days remaining, and maximize savings at checkout.',
        'Guidelines:',
        '- Reference exact stores, discount badges, promo codes, and expiry details from the Live CodeCoupon Catalog Context below whenever relevant. Never fabricate promo codes that are not listed in the catalog.',
        '- Clearly state whether an offer uses a copyable promo code or is an Instant Direct Deal with no code needed.',
        '- Mention how many days remain or the expiration date when a coupon has an expiry date set.',
        '- Keep responses concise, structured, and easy to scan with short bullet points.',
        safeContext ? `\nLive CodeCoupon Catalog Context:\n${safeContext}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const ai = getGeminiClient();

      const formattedHistory: Content[] = sanitizedHistory.map((item) => ({
        role: item.role,
        parts: [{ text: item.text }],
      }));

      const chat = ai.chats.create({
        model: selectedModel,
        history: formattedHistory,
        config: {
          systemInstruction,
        },
      });

      const response = await chat.sendMessage({ message: trimmedMessage });
      const reply = response.text ?? '';

      if (!reply.trim()) {
        return res.status(502).json({
          error: 'The assistant returned an empty response. Please try phrasing your question differently.',
        });
      }

      return res.json({
        reply,
        model: selectedModel,
      });
    } catch (error: unknown) {
      const err = error as { status?: number; code?: number; message?: string };
      const status = typeof err?.status === 'number' ? err.status : 500;
      const rawMessage = err?.message || 'Unable to process chat request.';

      if (
        status === 400 ||
        status === 403 ||
        rawMessage.includes('API_KEY_INVALID') ||
        rawMessage.includes('PERMISSION_DENIED')
      ) {
        return res.status(status === 403 ? 403 : 400).json({
          error:
            'Gemini API key authentication failed. Please check or update GEMINI_API_KEY in the Settings > Secrets panel.',
        });
      }

      if (status === 429 || rawMessage.includes('RESOURCE_EXHAUSTED')) {
        return res.status(429).json({
          error:
            'Gemini API rate limit or quota reached. Please wait a moment or check your billing tier in Settings > Secrets.',
        });
      }

      if (status === 404 || rawMessage.includes('NOT_FOUND')) {
        return res.status(404).json({
          error: 'The selected Gemini model could not be found or is unavailable.',
        });
      }

      return res.status(status >= 400 && status < 600 ? status : 500).json({
        error: rawMessage,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CodeCoupon server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
