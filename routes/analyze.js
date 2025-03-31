
const OpenAI = require('openai');
const pdfParse = require('pdf-parse');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async function(req, res) {
  try {
    const file = req.files?.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const text = (await pdfParse(file.data)).text;

    console.log("📄 Texto extraído del PDF:", text.slice(0, 300)); // Primeros 300 caracteres

    const prompt = `
Eres un reclutador de tecnología. Resume el siguiente currículum en 3 frases, da un puntaje general del 0 al 100 según su compatibilidad con un perfil tech senior, extrae 5 habilidades principales y da una recomendación si sería buena contratación.

Currículum:
${text}

Devuelve el resultado en formato JSON con estas claves:
{
  "nombre": "Nombre del candidato si se detecta",
  "puntaje": ...,
  "resumen": "...",
  "skills": [...],
  "recomendacion": "..."
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const raw = completion.choices[0].message.content;
    console.log("🧠 Respuesta cruda de OpenAI:", raw);

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      console.error("❌ Error al hacer JSON.parse:", parseError.message);
      return res.status(500).json({
        error: "Error al convertir respuesta de OpenAI a JSON",
        raw,
      });
    }

    res.json(parsed);

  } catch (err) {
    console.error("🔥 Error general en el análisis:", err);
    res.status(500).json({ error: 'Error al analizar el CV', details: err.message });
  }
};
