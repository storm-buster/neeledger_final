// Vercel Serverless Function: AI Document Comparison (Groq/Grok)
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { doc1Title, doc1Content, doc2Title, doc2Content } = req.body;

  if (!doc1Title || !doc1Content || !doc2Title || !doc2Content) {
    return res.status(400).json({ error: 'Missing required fields: doc1Title, doc1Content, doc2Title, doc2Content' });
  }

  // API keys from environment variables only
  const groqApiKey = process.env.GROQ_API_KEY;
  const grokApiKey = process.env.GROK_API_KEY;
  
  const useGroq = groqApiKey && groqApiKey.startsWith('gsk_');
  const apiKey = useGroq ? groqApiKey : grokApiKey;
  const apiUrl = useGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.x.ai/openai/v1/chat/completions';
  const modelName = useGroq ? 'llama-3.3-70b-versatile' : 'grok-beta';

  if (!apiKey) {
    return res.status(500).json({ error: 'AI API key not configured' });
  }

  const prompt = `You are an expert carbon credit verification analyst. Compare these two documents and provide a detailed analysis.

DOCUMENT 1: ${doc1Title}
${doc1Content}

---

DOCUMENT 2: ${doc2Title}
${doc2Content}

---

Analyze both documents and provide comparison in the following JSON format:
{
  "summary": "Brief summary of the comparison (2-3 sentences)",
  "keyDifferences": ["List of 3-5 main differences between the documents"],
  "concerns": ["List of any concerning discrepancies or red flags"],
  "recommendations": ["List of recommended actions for the reviewer"],
  "overallAssessment": "APPROVE or REVIEW or REJECT",
  "confidence": 0.85
}

Focus on:
1. Discrepancies in carbon credit estimates
2. Methodology differences
3. Data accuracy and consistency
4. Risk assessment alignment
5. Compliance with standards
6. Any missing or conflicting information

Return ONLY valid JSON, no additional text.`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: `AI API error: ${response.statusText}`,
        details: errorData
      });
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;

    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not parse AI response as JSON' });
    }

    const result = JSON.parse(jsonMatch[0]);
    res.json(result);

  } catch (error) {
    console.error('AI API request error:', error);
    res.status(500).json({
      error: 'Failed to call AI API',
      message: error.message
    });
  }
}
