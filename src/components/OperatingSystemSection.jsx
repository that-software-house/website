import { Link } from 'react-router-dom'
import ChromaGrid from './vendor/ChromaGrid'
import SpotlightCard from './vendor/SpotlightCard'
import './OperatingSystemSection.css'

const serviceItems = [
  {
    marker: '01 / MAIN STREET',
    title: 'Main Street Modernization',
    subtitle: '$749 Clean Stack migration',
    description:
      'We move established local businesses off slow, fragile WordPress setups and into fast, secure stacks your team can trust.',
    meta: '$89/mo maintenance and technical support',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=84',
    alt: 'Local business owner working with a modern laptop.',
    accent: 'var(--color-yellow)',
    gradient:
      'linear-gradient(145deg, var(--color-home-dark-panel-soft), var(--color-black))',
    spotlight: 'var(--color-home-yellow-wash)',
  },
  {
    marker: '02 / AI OPS',
    title: 'AI Integration & Operational Intelligence',
    subtitle: 'Private business knowledge, made searchable',
    description:
      'We turn PDFs, notes, histories, and internal process knowledge into a practical AI Brain with RAG, intake, and summaries.',
    meta: 'Built for professional service teams',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1400&q=84',
    alt: 'Business documents and operational records on a desk.',
    accent: 'var(--color-sky)',
    gradient:
      'linear-gradient(145deg, var(--color-home-dark-panel-soft), var(--color-black))',
    spotlight: 'var(--hero-glow-sky)',
  },
  {
    marker: '03 / STARTUPS',
    title: 'High-Velocity Startup Engineering',
    subtitle: 'Senior product delivery without the hiring gap',
    description:
      'We drop in as an elastic product squad to shape MVPs, harden prototypes, and ship investor-ready product systems.',
    meta: 'For solo founders, seed teams, and Series A',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=84',
    alt: 'Product team working together in a startup meeting.',
    accent: 'var(--color-mint)',
    gradient:
      'linear-gradient(145deg, var(--color-home-dark-panel-soft), var(--color-black))',
    spotlight: 'var(--hero-glow-mint)',
  },
  {
    marker: '04 / CONVERSION',
    title: 'Conversion-First Marketing',
    subtitle: 'Precision data before louder marketing',
    description:
      'We find where leads drop, fix system friction, and optimize the technical path from attention to revenue.',
    meta: 'For growth-ready businesses with high revenue per customer',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=84',
    alt: 'Analytics and performance data shown on a workstation.',
    accent: 'var(--color-yellow)',
    gradient:
      'linear-gradient(145deg, var(--color-home-dark-panel-soft), var(--color-black))',
    spotlight: 'var(--color-home-yellow-wash)',
  },
]

const proofItems = [
  {
    value: '20+',
    label: 'products shipped',
    body: 'Across healthcare, fintech, SaaS, AI, and local business modernization.',
  },
  {
    value: '25+',
    label: 'years founding-team experience',
    body: 'Senior judgment without turning the relationship into a big-agency maze.',
  },
  {
    value: 'Austin + San Francisco',
    label: 'senior engineering studio',
    body: 'Close to operators, founders, and growth teams who need software to work.',
  },
]

const clientItems = [
  'Dental Clinics',
  'CPAs',
  'Law Firms',
  'Auto Body Shops',
  'Salons',
  'Landscaping',
  'Architects',
  'Seed Founders',
  'Series A Teams',
]

function OperatingSystemSection() {
  return (
    <section className="operating-system-section">
      <div className="operating-system-section__inner">
        <div className="operating-system-section__header">
          <p>TSH OPERATING SYSTEM</p>
          <h2>Business software, treated like infrastructure.</h2>
          <span>
            TSH is built for owners, founders, and operators who need practical
            engineering help without a bloated agency process. The story is simple:
            clean up the stack, make knowledge usable, ship the product, and keep
            improving the system after launch.
          </span>
        </div>

        <ChromaGrid
          className="operating-system-section__grid"
          columns={4}
          items={serviceItems}
          radius={360}
        />

        <div className="operating-system-section__proof">
          {proofItems.map((item) => (
            <SpotlightCard
              className="operating-system-section__proof-card"
              key={item.label}
              spotlightColor="var(--color-home-yellow-wash-soft)"
            >
              <strong>{item.value}</strong>
              <span>{item.label}</span>
              <p>{item.body}</p>
            </SpotlightCard>
          ))}
        </div>

        <SpotlightCard
          className="operating-system-section__clients"
          spotlightColor="var(--hero-glow-mint)"
        >
          <div>
            <p>PERFECT CLIENTS</p>
            <h3>For teams stuck between old tools and serious growth.</h3>
            <span>
              The best fit is not a company size. It is a business with enough
              operating pressure that better software will actually change the day.
            </span>
          </div>

          <ul>
            {clientItems.map((client) => (
              <li key={client}>{client}</li>
            ))}
          </ul>
        </SpotlightCard>

        <div className="operating-system-section__handoff">
          <div>
            <p>HOW WE WORK WITH YOU</p>
            <h3>A senior team that stays close to the work.</h3>
            <span>
              We work directly with the people closest to the business, explain
              tradeoffs in plain language, and keep momentum visible from first audit
              to launch.
            </span>
          </div>
          <Link to="/contact">Start a conversation</Link>
        </div>
      </div>
    </section>
  )
}

export default OperatingSystemSection
