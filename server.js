
import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: '30kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/survey', async (req, res) => {
  try {
    const endpoint = process.env.GOOGLE_SHEETS_WEB_APP_URL;

    if (!endpoint) {
      return res.status(503).json({
        error: 'Falta configurar GOOGLE_SHEETS_WEB_APP_URL en Render.'
      });
    }

    const entry = req.body || {};

    if (!entry.respuestas ||
        Object.keys(entry.respuestas).length !== 10) {
      return res.status(400).json({
        error: 'La encuesta debe incluir las 10 respuestas.'
      });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
      redirect: 'follow'
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(502).json({
        error: 'Google Sheets no aceptó el registro: ' + response.status
      });
    }

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = {};
    }

    if (result.ok === false) {
      return res.status(502).json({
        error: result.error || 'No se pudo guardar en Google Sheets.'
      });
    }

    res.json({ ok: true });

  } catch (err) {
    console.error('Error guardando encuesta:', err.message);
    res.status(500).json({
      error: 'No fue posible guardar la encuesta.'
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    configured: Boolean(process.env.OPENAI_API_KEY),
    model: process.env.OPENAI_MODEL || 'gpt-6-astra'
  });
});

app.post('/api/recommend', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({
        error: 'El servidor no tiene OPENAI_API_KEY configurada.'
      });
    }

    const {
      destination = '',
      interests = [],
      question = ''
    } = req.body || {};

    const safeDestination = String(destination).slice(0, 160);
    const safeInterests = Array.isArray(interests)
      ? interests.slice(0, 10).map(x => String(x).slice(0, 40))
      : [];
    const safeQuestion = String(question).slice(0, 1800);

    const instructions =
      'Eres el asistente turístico del proyecto POP para viajeros en Colombia. Responde en español claro, breve, útil y amable. Personaliza usando el destino y los intereses suministrados. No inventes precios, disponibilidad, horarios, direcciones ni reservas. Recomienda verificar la información con proveedores oficiales.';

    const input =
      `Destino: ${safeDestination || 'No especificado'}\n` +
      `Intereses: ${safeInterests.join(', ') || 'No especificados'}\n` +
      `Consulta: ${safeQuestion}`;

    const response = await fetch(
      'https://api.openai.com/v1/responses',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || 'gpt-6-astra',
          instructions,
          input,
          max_output_tokens: 700,
          store: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const message = data?.error?.message ||
        `OpenAI API respondió ${response.status}`;
      return res.status(response.status).json({ error: message });
    }

    let output = data.output_text || '';

    if (!output && Array.isArray(data.output)) {
      output = data.output
        .flatMap(item => item.content || [])
        .filter(c => c.type === 'output_text')
        .map(c => c.text)
        .join('\n');
    }

    if (!output) {
      return res.status(502).json({
        error: 'La API no devolvió texto. Intenta nuevamente.'
      });
    }

    res.json({
      text: output,
      model: data.model || process.env.OPENAI_MODEL || 'gpt-6-astra'
    });

  } catch (err) {
    console.error('Error API:', err.message);
    res.status(500).json({
      error: 'Error interno al consultar el servicio de IA.'
    });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`POP disponible en http://localhost:${port}`);
});
