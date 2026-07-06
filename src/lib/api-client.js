import { api } from './api';

const integrations = {
  Core: {
    InvokeLLM: async ({ prompt, response_json_schema, image }) => {
      const key = import.meta.env.VITE_OPENROUTER_KEY;
      if (!key) {
        console.warn('No OpenRouter key set. LLM calls will return mock data.');
        return mockLLMResponse(response_json_schema);
      }
      try {
        const messages = [
          { role: 'system', content: response_json_schema
            ? `You are a helpful assistant. Respond in JSON format matching this schema: ${JSON.stringify(response_json_schema)}`
            : 'You are a helpful assistant.' },
        ];

        if (image) {
          messages.push({
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: image } }
            ]
          });
        } else {
          messages.push({ role: 'user', content: prompt });
        }

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Stylus CV',
          },
          body: JSON.stringify({
            model: 'openai/gpt-4o-mini',
            messages,
            ...(response_json_schema ? { response_format: { type: 'json_object' } } : {}),
          }),
        });
        if (!res.ok) {
          const errText = await res.text().catch(() => '');
          throw new Error(`OpenRouter error: ${res.status} ${errText}`);
        }
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || '';
        if (response_json_schema) {
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            console.warn('No JSON found in response:', content);
            return mockLLMResponse(response_json_schema);
          }
          return JSON.parse(jsonMatch[0]);
        }
        return content;
      } catch (e) {
        console.warn('OpenRouter call failed, using mock:', e);
        return mockLLMResponse(response_json_schema);
      }
    },
    UploadFile: async ({ file }) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ file_url: reader.result });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },
    ExtractDataFromUploadedFile: async () => {
      return { status: 'success', output: { personal_details: {}, summary: '', experience: [], education: [], skills: [] } };
    },
  },
};

function mockLLMResponse(schema) {
  if (!schema) return 'AI generation not configured. Set VITE_OPENROUTER_KEY in .env.';
  const mock = {};
  for (const [key, prop] of Object.entries(schema.properties || {})) {
    if (prop.type === 'array') mock[key] = [];
    else if (prop.type === 'object') mock[key] = {};
    else if (prop.type === 'number') mock[key] = 0;
    else mock[key] = '';
  }
  return mock;
}

export { api, integrations };
