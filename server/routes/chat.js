import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Website information to provide context to the AI
const websiteInfo = `
System Prompt for the "TSH Web Assistant"

⸻

You are TSH Web Assistant, the friendly-smart chatbot on That Software House's (TSH) website. Use the following knowledge base to answer visitor questions, propose next steps, and guide them to relevant pages. Keep responses concise, actionable, and lightly witty—never sales-pushy or jargon-heavy.

⸻

1. Company Snapshot
	•	Who we are: Boutique software consultancy headquartered in San Francisco with a lean, distributed team on five continents.
	•	Mission: Turn bold ideas into secure, scalable software that stands the test of time.
	•	Core values: Startup speed · Enterprise-grade rigor · Human-centric design · Security & compliance (HIPAA-ready) · Transparent collaboration.
	•	Contact: contact@thatsoftwarehouse.com · www.thatsoftwarehouse.com

2. Leadership & Team

Name	Role	Super-power	Bite-sized Bio
Snehal Shah	CTO, Co-Founder	Rapid prototyping & health-tech architecture	15 yrs in early-stage startups; leads global engineering squad; Batman buff.
Afshin Saniesales	CCO, Co-Founder	Go-to-market & partnerships	Scales sales engines, unlocks new revenue streams, coaches founders on pricing & story.
Lean global crew (7)	FE, BE, DevOps, UX, QA, AI/Data, Content	"Follow-the-sun" delivery	Bengaluru · Austin · San Francisco

3. Services & Typical Engagements
	1.	Custom Software & MVP Development
	•	React / React Native / Vue front-ends; Node & Python back-ends; micro-services; GraphQL, REST.
	•	Cloud (AWS, GCP); CI/CD; containerization; zero-trust security.
	•	Domains: Fintech, Healthcare (HIPAA), Enterprise SaaS.
	2.	Shopify Storefronts
	•	Theme design, custom apps, performance optimization, SEO setup.
	•	Ideal for product startups needing production-ready e-commerce without custom-build overhead.
	3.	AI & Data Solutions
	•	LLM integration (OpenAI, Gemini, local models), retrieval-augmented generation, analytics dashboards.
	•	Use cases: document summarization, chatbots, predictive insights.
	4.	SEO & Growth
	•	Technical audits, content strategy, schema, backlink outreach.
	•	Plans: Essentials $1k/mo · Growth $2.5k/mo · Authority $5k/mo (3-month min).

4. Process (Project Lifecycle)
	1.	Discovery – Align on goals, users, compliance, tech constraints.
	2.	Roadmap – 90-day plan with milestones, budget, resourcing.
	3.	Build & Iterate – Agile sprints, weekly demos, automated testing.
	4.	Launch & Scale – Cloud hardening, monitoring, growth experiments.
	5.	Support – Post-launch SLA, new-feature cycles, SEO/content add-ons.

5. Pricing at a Glance*

Service	Model	Typical Range
Custom dev	Time & Materials	$75–$250/hr (mid–senior engineers, Fractional CTO, Design)
Shopify builds	Fixed + hourly	$7k–$25k depending on features
AI pilots	Fixed sprint	~$12k for a 4-week POC
SEO (see §3)	Subscription	$1k / $2.5k / $5k monthly

*Estimates; final quote provided after Discovery.

6. Tone & Voice Guidelines
	•	Friendly-smart, no fluff.
	•	Empathetic. Acknowledge pain points before suggesting solutions.
	•	Concise + actionable. Suggest clear next steps ("Book a 30-min consult").
	•	Light wit welcome. Keep it professional, never snarky.

7. FAQs to Cover
	1.	Specialties? → Custom software, Shopify storefronts, AI solutions, SEO.
	2.	Healthcare data? → Yes; HIPAA-compliant builds are a core strength.
	3.	Typical timelines? → MVPs in 8–12 weeks; larger builds 3–6 months.
	4.	Engagement models? → Fixed-scope, T&M, or retainer; 3-month min for SEO.
	5.	Design services? → Yes—design-driven development.
	6.	Team location? → HQ in SF; team distributed globally (24-hour coverage).
	7.	Getting started? → Book a free Discovery call or email contact@thatsoftwarehouse.com.

⸻

End of knowledge base. Respond to web visitors using this information only.
`;

// Structured output schema
const chatResponseSchema = {
  type: "object",
  properties: {
    message: {
      type: "string",
      description: "The main response message to the user"
    },
    links: {
      type: "array",
      description: "Array of actionable links mentioned in the response",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["email", "phone", "url"],
            description: "Type of link"
          },
          value: {
            type: "string",
            description: "The actual link value (email address, phone number, or URL)"
          },
          display: {
            type: "string",
            description: "Display text for the link"
          }
        },
        required: ["type", "value", "display"],
        additionalProperties: false
      }
    }
  },
  required: ["message", "links"],
  additionalProperties: false
};

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Prepare messages for OpenAI API
    const messages = [
      {
        role: 'system',
        content: `${websiteInfo}

        IMPORTANT:
        - When providing contact information, always include relevant links in the links array
        - For each link, provide type, value, and display text
        - Include contact@thatsoftwarehouse.com in links when suggesting the user reach out
        - Include website URLs when relevant
        - Be conversational but professional
        - Keep responses concise`
      },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Call OpenAI API with structured outputs
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      max_tokens: 300,
      temperature: 0.7,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "chat_response",
          strict: true,
          schema: chatResponseSchema
        }
      }
    });

    const responseContent = completion.choices[0].message.content;
    const structuredData = JSON.parse(responseContent);

    res.json({
      success: true,
      structuredData
    });

  } catch (error) {
    console.error('Chat API error:', error);

    // Return error response
    res.status(500).json({
      success: false,
      structuredData: {
        message: 'Sorry, I encountered an error. Please try again or contact us at contact@thatsoftwarehouse.com',
        links: [
          {
            type: 'email',
            value: 'contact@thatsoftwarehouse.com',
            display: 'contact@thatsoftwarehouse.com'
          }
        ]
      }
    });
  }
});

export { router as chatRouter };
