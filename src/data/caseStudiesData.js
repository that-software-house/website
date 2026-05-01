export const caseStudies = {
  'vox-health': {
    slug: 'vox-health',
    client: 'Vox Health',
    tagline: 'Brand identity, design system, and website — zero to launch in under two weeks.',
    category: 'Healthcare AI · Brand & Web',
    industry: 'Dental AI / Healthcare SaaS',
    services: ['Brand Identity', 'Design System', 'Website'],
    timeline: 'Under 2 weeks',
    year: '2025',
    engagement: 'Brand sprint',

    heroImage: {
      src: '/images/case-studies/voxhealth-hero.jpg',
      alt: 'Vox Health — full brand in use: logo, color palette, and website mockup',
      placeholder: true,
    },

    heroStats: [
      { value: '13', unit: 'days', label: 'Zero to launched' },
      { value: '3+', unit: null, label: 'Brand systems explored' },
      { value: '42%', unit: null, label: 'Fewer patient no-shows' },
    ],

    brief: {
      heading: 'The Brief',
      paragraphs: [
        'Vox Health came to TSH with a clear mission but no visual language to match it. The company had built something genuinely useful — an AI platform that automates the phone calls, scheduling, insurance verification, and follow-up workflows that quietly drain dental practices of time and money. Their product reduces no-shows by 42%, cuts admin overhead by 60%, and improves collections by 24%. The technology was real. The brand was not.',
        'Their CEO came to us with nothing more than a vision: build a brand that communicates trust, intelligence, and clarity in a space — healthcare AI — that is easy to get wrong. No logo. No colors. No existing visual direction. Just a product that deserved to look like it belonged in the same room as the problem it was solving.',
      ],
      callout: 'The technology was real. The brand was not.',
    },

    challenge: {
      heading: 'The Challenge',
      intro: 'Dental AI is a crowded and skeptical space. Dental practices are typically risk-averse buyers. The brand needed to accomplish two things simultaneously that often work against each other.',
      tensions: [
        {
          label: 'Feel Human',
          body: 'Healthcare is inherently personal. A brand that leads too hard with "AI" risks feeling cold, clinical, or threatening to the care teams it\'s designed to assist.',
        },
        {
          label: 'Feel Credible',
          body: 'A SaaS platform targeting DSOs (Dental Service Organizations) and multi-practice groups needs to signal enterprise-grade seriousness — HIPAA compliance, SOC 2 certification, deep PMS integrations with Dentrix, Eaglesoft, and Open Dental. It can\'t look like a startup side project.',
        },
      ],
      needle: 'A brand that is modern without being sterile, intelligent without being impersonal.',
    },

    process: [
      {
        phase: '01',
        label: 'Discovery',
        heading: 'Understand before designing.',
        body: 'We assigned a senior designer to the engagement from day one. No handoffs, no junior proxies — the person running the discovery call was the same person building the brand. The first step was a structured discovery session with the founder. We weren\'t there to collect a mood board. We were there to understand the strategic ambition of the company: Who is the buyer? What does success look like for a dental practice in year one? What does Vox Health believe about the relationship between technology and patient care? One thing emerged clearly: Vox Health\'s core belief is that technology should enhance the human connection in healthcare, not replace it. That became the conceptual spine of every design decision that followed.',
        image: {
          src: '/images/case-studies/voxhealth-discovery.jpg',
          alt: 'Discovery session artifacts — brand positioning map, audience definition, and competitive landscape analysis',
          placeholder: true,
        },
      },
      {
        phase: '02',
        label: 'Exploration',
        heading: 'Three directions. Three points of view.',
        body: 'With the strategy anchored, we moved into rapid ideation. Within days, we had developed multiple distinct brand directions — each one a coherent system, not just a logo sketch. Every direction had a point of view: Direction A was clean, geometric, enterprise-forward — built for the CFO making a software decision. Direction B was warmer, more approachable, human-centered — built for the front desk coordinator who uses the product every day. Direction C was a synthesis — professional enough to close the enterprise deal, human enough to earn daily trust. We presented all directions to the founder without editorializing. Our job at this stage was to show, not sell.',
        carousel: true,
        images: [
          {
            src: '/images/case-studies/voxhealth-direction-a.jpg',
            alt: 'Direction A — clean, geometric, enterprise-forward logo mark and color palette',
            placeholder: true,
          },
          {
            src: '/images/case-studies/voxhealth-direction-b.jpg',
            alt: 'Direction B — warm, human-centered logo mark with approachable typography',
            placeholder: true,
          },
          {
            src: '/images/case-studies/voxhealth-direction-c.jpg',
            alt: 'Direction C — synthesis direction balancing enterprise credibility and human warmth',
            placeholder: true,
          },
        ],
      },
      {
        phase: '03',
        label: 'Refinement',
        heading: 'Test where it actually lives.',
        body: 'The founder narrowed the field to two directions. From there, the process became surgical. We tested the leading candidates across the real surfaces where the brand would live — the website header, the platform UI, email signatures, and mobile. A logo that looks great in a PDF can collapse in a browser at 14px. We caught those failure points in the refinement stage, not in production. After a second round of feedback and final iteration, one direction emerged as clearly right. Not a compromise — a clear winner that both the founder and the design team believed in.',
        carousel: true,
        images: [
          {
          src: '/images/case-studies/voxhealth-refinement-a.jpg',
          alt: '',
          placeholder: true,
          },
          {
            src: '/images/case-studies/voxhealth-refinement-b.jpg',
            alt: '',
            placeholder: true,
          }
        ],
      },
    ],

    outcomes: {
      heading: 'The Result',
      subheading: 'The final Vox Health brand is a system, not just a logo. Built to scale from a browser favicon to a conference banner.',
      body: [
        'Wordmark & logomark — a mark that scales cleanly from a browser favicon to a conference banner.',
        'Color palette — a primary palette that reads trustworthy and modern, with supporting tones for UI state and data visualization contexts.',
        'Typography system — paired typefaces: one for hierarchy and authority, one for warmth and body content.',
        'Component library — the design system that powers the website and informs the product UI.',
        'Website — built from the system up, translating the brand into a live digital experience.',
      ],
      metrics: [
        { value: '< 2wk', label: 'Total timeline' },
        { value: '3+', label: 'Full systems explored' },
        { value: '2', label: 'Focused refinement rounds' },
        { value: '0', label: 'Days of radio silence' },
      ],
      images: [
        {
          src: '/images/case-studies/voxhealth-website-desktop.jpg',
          alt: 'Full desktop screenshot of voxhealth.ai homepage',
          placeholder: true,
        },
        {
          src: '/images/case-studies/voxhealth-website-mobile.jpg',
          alt: 'Mobile view of key pages — homepage and platform overview',
          placeholder: true,
        },
      ],
    },

    deliverables: [
      { item: 'Brand Strategy', detail: 'Positioning, audience definition, brand voice' },
      { item: 'Logo System', detail: 'Primary mark, alternate lockups, favicon' },
      { item: 'Color Palette', detail: 'Primary, secondary, and UI-state color tokens' },
      { item: 'Typography', detail: 'Typeface selection and hierarchy system' },
      { item: 'Design System', detail: 'Component library for web and product use' },
      { item: 'Website', detail: 'Full marketing site — designed and developed' },
    ],

    tshDifference: {
      heading: 'The TSH Difference',
      body: "We don't run design through a committee of account managers and junior contractors. The senior designer who ran the discovery call was the one who built the brand. That's not a pitch — it's how we're structured. For Vox Health, that meant a founder got honest, direct feedback on what was and wasn't working. No filters. No \"the client wants X so we'll give them X.\" When a direction wasn't the right call, we said so — and we brought the evidence (mockups, use-case tests) to back it up.",
    },

    testimonial: {
      // Placeholder — replace with actual quote from Vox Health CEO/founder
      quote: "That Software House understood my requirements and their designer was able to translate that into beautiful designs. Extremely professional with high quality.",
      author: 'Founder & CEO',
      company: 'Vox Health',
    },

    seo: {
      title: 'Vox Health Case Study | That Software House',
      description: 'How TSH built the Vox Health brand identity, design system, and full marketing website in under two weeks — zero to launch for a dental AI startup.',
      keywords: 'healthcare AI branding, dental SaaS design system, startup brand identity, TSH case study, design sprint, Vox Health',
      canonicalUrl: 'https://thatsoftwarehouse.com/case-studies/vox-health',
    },
  },
};
