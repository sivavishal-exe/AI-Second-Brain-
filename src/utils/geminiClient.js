/**
 * Gemini API Client
 * Performs requests directly to the Gemini API endpoint
 */

export const generateGeminiContent = async (apiKey, prompt, systemInstruction = '') => {
  if (!apiKey) {
    throw new Error('Gemini API Key is not set.');
  }

  // Using the stable Gemini 1.5 Flash model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [
        { text: systemInstruction }
      ]
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData?.error?.message || `HTTP error! status: ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('No content returned from Gemini.');
  }
  return text;
};
