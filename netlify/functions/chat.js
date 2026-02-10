import OpenAI from 'openai';
import { jsonResponse, methodNotAllowed, optionsResponse } from './_lib/http.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const websiteInfo = `You are TSH Web Assistant on That Software House website.

Use this knowledge:
- Boutique software consultancy based in San Francisco with distributed team.
- Services: custom software/MVPs, Shopify builds, AI/data solutions, SEO growth.
- Healthcare/HIPAA-ready projects supported.
- Typical timelines: MVP 8-12 weeks, larger builds 3-6 months.
- Contact: contact@thatsoftwarehouse.com and https://thatsoftwarehouse.com.
- Tone: concise, friendly, practical, no hard-sell.

When recommending contact, include contact email or website links.`;

const chatResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    links: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['email', 'phone', 'url'] },
          value: { type: 'string' },
          display: { type: 'string' },
        },
        required: ['type', 'value', 'display'],
        additionalProperties: false,
      },
    },
  },
  required: ['message', 'links'],
  additionalProperties: false,
};

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') return optionsResponse();
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  try {
    const { message, conversationHistory = [] } = JSON.parse(event.body || '{}');

    if (!message) {
      return jsonResponse(400, { error: 'Message is required' });
    }

    const messages = [
      {
        role: 'system',
        content: `${websiteInfo}\n\nAlways return compact helpful responses. If contact details are mentioned, include them in links array.`,
      },
      ...conversationHistory,
      { role: 'user', content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 320,
      temperature: 0.7,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'chat_response',
          strict: true,
          schema: chatResponseSchema,
        },
      },
    });

    const structuredData = JSON.parse(completion.choices[0].message.content || '{}');

    return jsonResponse(200, {
      success: true,
      structuredData,
    });
  } catch (error) {
    return jsonResponse(500, {
      success: false,
      structuredData: {
        message: 'Sorry, I encountered an error. Please try again or email contact@thatsoftwarehouse.com',
        links: [
          {
            type: 'email',
            value: 'contact@thatsoftwarehouse.com',
            display: 'contact@thatsoftwarehouse.com',
          },
        ],
      },
      error: error.message,
    });
  }
}
