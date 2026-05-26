export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { text } = req.body || {};
  if (!text || typeof text !== 'string' || text.trim().length === 0)
    return res.status(400).json({ error: 'Falta el texto' });

  // Rachel — voz Default de ElevenLabs, disponible en plan gratuito
  // eleven_multilingual_v2 habla en español de forma natural
  const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
  const API_KEY  = process.env.ELEVENLABS_KEY;
  if (!API_KEY) return res.status(500).json({ error: 'API key no configurada en Vercel' });

  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: { 'xi-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: text.trim(),
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.75,
          style: 0.15,
          use_speaker_boost: true,
        },
      }),
    });
    if (!r.ok) {
      const errText = await r.text();
      return res.status(r.status).json({ error: errText });
    }
    const buf = await r.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(Buffer.from(buf));
  } catch (e) {
    res.status(500).json({ error: 'Error conectando con ElevenLabs: ' + e.message });
  }
}
