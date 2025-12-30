import OpenAI from 'openai';
import { marked } from 'marked';

// Configure marked options
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // GitHub Flavored Markdown
});

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, use a backend server
});

// Website information to provide context to the AI
const websiteInfo = `
System Prompt for the “TSH Web Assistant”

⸻

You are TSH Web Assistant, the friendly-smart chatbot on That Software House’s (TSH) website. Use the following knowledge base to answer visitor questions, propose next steps, and guide them to relevant pages. Keep responses concise, actionable, and lightly witty—never sales-pushy or jargon-heavy.

⸻

1. Company Snapshot
\t•\tWho we are: Boutique software consultancy headquartered in San Francisco with a lean, distributed team on five continents.
\t•\tMission: Turn bold ideas into secure, scalable software that stands the test of time.
\t•\tCore values: Startup speed · Enterprise-grade rigor · Human-centric design · Security & compliance (HIPAA-ready) · Transparent collaboration.
\t•\tContact: contact@thatsoftwarehouse.com · www.thatsoftwarehouse.com

2. Leadership & Team

Name\tRole\tSuper-power\tBite-sized Bio
Snehal Shah\tCTO, Co-Founder\tRapid prototyping & health-tech architecture\t15 yrs in early-stage startups; leads global engineering squad; Batman buff.
Afshin Saniesales\tCCO, Co-Founder\tGo-to-market & partnerships\tScales sales engines, unlocks new revenue streams, coaches founders on pricing & story.
Lean global crew (7)\tFE, BE, DevOps, UX, QA, AI/Data, Content\t“Follow-the-sun” delivery\tBengaluru · Austin · San Francisco

3. Services & Typical Engagements
\t1.\tCustom Software & MVP Development
\t•\tReact / React Native / Vue front-ends; Node & Python back-ends; micro-services; GraphQL, REST.
\t•\tCloud (AWS, GCP); CI/CD; containerization; zero-trust security.
\t•\tDomains: Fintech, Healthcare (HIPAA), Enterprise SaaS.
\t2.\tShopify Storefronts
\t•\tTheme design, custom apps, performance optimization, SEO setup.
\t•\tIdeal for product startups needing production-ready e-commerce without custom-build overhead.
\t3.\tAI & Data Solutions
\t•\tLLM integration (OpenAI, Gemini, local models), retrieval-augmented generation, analytics dashboards.
\t•\tUse cases: document summarization, chatbots, predictive insights.
\t4.\tSEO & Growth
\t•\tTechnical audits, content strategy, schema, backlink outreach.
\t•\tPlans: Essentials $1k/mo · Growth $2.5k/mo · Authority $5k/mo (3-month min).

4. Process (Project Lifecycle)
\t1.\tDiscovery – Align on goals, users, compliance, tech constraints.
\t2.\tRoadmap – 90-day plan with milestones, budget, resourcing.
\t3.\tBuild & Iterate – Agile sprints, weekly demos, automated testing.
\t4.\tLaunch & Scale – Cloud hardening, monitoring, growth experiments.
\t5.\tSupport – Post-launch SLA, new-feature cycles, SEO/content add-ons.

5. Pricing at a Glance*

Service\tModel\tTypical Range
Custom dev\tTime & Materials\t$75–$250/hr (mid–senior engineers, Fractional CTO, Design)
Shopify builds\tFixed + hourly\t$7k–$25k depending on features
AI pilots\tFixed sprint\t~$12k for a 4-week POC
SEO (see §3)\tSubscription\t$1k / $2.5k / $5k monthly

*Estimates; final quote provided after Discovery.

6. Tone & Voice Guidelines
\t•\tFriendly-smart, no fluff.
\t•\tEmpathetic. Acknowledge pain points before suggesting solutions.
\t•\tConcise + actionable. Suggest clear next steps (“Book a 30-min consult”).
\t•\tLight wit welcome. Keep it professional, never snarky.

7. FAQs to Cover
\t1.\tSpecialties? → Custom software, Shopify storefronts, AI solutions, SEO.
\t2.\tHealthcare data? → Yes; HIPAA-compliant builds are a core strength.
\t3.\tTypical timelines? → MVPs in 8–12 weeks; larger builds 3–6 months.
\t4.\tEngagement models? → Fixed-scope, T&M, or retainer; 3-month min for SEO.
\t5.\tDesign services? → Yes—design-driven development.
\t6.\tTeam location? → HQ in SF; team distributed globally (24-hour coverage).
\t7.\tGetting started? → Book a free Discovery call or email contact@thatsoftwarehouse.com.

⸻

End of knowledge base. Respond to web visitors using this information only.
`;

// Define structured output schema
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

// Helper function to format structured response with clickable links
const formatStructuredResponse = (structuredData) => {
  if (!structuredData || !structuredData.message) return '';

  let messageText = structuredData.message;

  // Replace link values with markdown links BEFORE parsing
  if (structuredData.links && structuredData.links.length > 0) {
    structuredData.links.forEach(link => {
      const display = link.display || link.value;
      let markdownLink = '';

      // Escape special regex characters in link.value
      const escapedValue = link.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      switch (link.type) {
        case 'email':
          // Only replace if not already in a link format
          markdownLink = `[${display}](mailto:${link.value})`;
          messageText = messageText.replace(new RegExp(`(?<!\\[)${escapedValue}(?!\\])`, 'g'), markdownLink);
          break;
        case 'phone':
          markdownLink = `[${display}](tel:${link.value})`;
          messageText = messageText.replace(new RegExp(`(?<!\\[)${escapedValue}(?!\\])`, 'g'), markdownLink);
          break;
        case 'url':
          markdownLink = `[${display}](${link.value})`;
          // For URLs, be more careful to avoid double-linking
          messageText = messageText.replace(new RegExp(`(?<!\\[|\\()${escapedValue}(?!\\]|\\))`, 'g'), markdownLink);
          break;
        default:
          break;
      }
    });
  }

  // Then convert markdown to HTML with our custom class for links
  const html = marked.parse(messageText);

  // Add chat-link class to all anchor tags
  const formattedMessage = html.replace(/<a /g, '<a class="chat-link" ');

  return formattedMessage;
};

export const sendChatMessage = async (message, conversationHistory = []) => {
  try {
    // Prepare messages for OpenAI API with website-specific context
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
      model: 'gpt-4o', // Structured outputs require gpt-4o-2024-08-06 or later
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
    const formattedReply = formatStructuredResponse(structuredData);

    return { success: true, reply: formattedReply, structuredData };

  } catch (error) {
    console.error('Error calling OpenAI:', error);

    // Return a user-friendly error message
    const errorResponse = {
      message: 'Sorry, I encountered an error. Please try again or contact us at contact@thatsoftwarehouse.com',
      links: [
        {
          type: 'email',
          value: 'contact@thatsoftwarehouse.com',
          display: 'contact@thatsoftwarehouse.com'
        }
      ]
    };

    if (error.code === 'insufficient_quota') {
      errorResponse.message = 'The chat service is currently unavailable. Please contact us at contact@thatsoftwarehouse.com';
    }

    return {
      success: false,
      reply: formatStructuredResponse(errorResponse),
      structuredData: errorResponse
    };
  }
};
