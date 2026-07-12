import { api } from './api';

const integrations = {
  Core: {
    InvokeLLM: async ({ prompt, response_json_schema, image }) => {
      const key = import.meta.env.VITE_OPENROUTER_KEY;
      if (!key) {
        throw new Error('AI features require an OpenRouter API key. Please configure VITE_OPENROUTER_KEY.');
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
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        return new Promise((resolve) => {
          const img = new Image();
          const url = URL.createObjectURL(file);
          img.onload = () => {
            URL.revokeObjectURL(url);
            let w = img.width, h = img.height;
            const maxDim = 800;
            if (w > maxDim || h > maxDim) {
              const ratio = Math.min(maxDim / w, maxDim / h);
              w = Math.round(w * ratio);
              h = Math.round(h * ratio);
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, w, h);
            resolve({ file_url: canvas.toDataURL('image/jpeg', 0.8) });
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            const reader = new FileReader();
            reader.onload = () => resolve({ file_url: reader.result });
            reader.readAsDataURL(file);
          };
          img.src = url;
        });
      }
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
