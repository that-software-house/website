import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { caseStudies } from '@/data/caseStudiesData';
import './CaseStudy.css';

function useScrollReveal() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = container.querySelectorAll('.cs-reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('cs-revealed');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -48px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return containerRef;
}

function ImagePlaceholder({ alt, className = '', ratio = '16/9' }) {
  return (
    <figure
      className={`cs-img-placeholder ${className}`}
      style={{ aspectRatio: ratio }}
      role="img"
      aria-label={alt}
    >
      <figcaption className="cs-img-placeholder__alt">{alt}</figcaption>
    </figure>
  );
}

function PhaseCarousel({ images, className = '' }) {
  const trackRef = useRef(null);
  const [current, setCurrent] = useState(0);
  const total = images.length;

  const scrollTo = (index) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.offsetWidth, behavior: 'smooth' });
    setCurrent(index);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setCurrent(Math.round(track.scrollLeft / track.offsetWidth));
  };

  return (
    <div className="cs-carousel">
      <div className="cs-carousel__track" ref={trackRef} onScroll={onScroll}>
        {images.map((img, i) => (
          <div key={i} className="cs-carousel__slide">
            <CaseStudyImage
              image={img}
              alt={img?.alt}
              className={className || 'cs-phase__img'}
            />
          </div>
        ))}
      </div>
      {total > 1 && (
        <>
          <div className="cs-carousel__controls" aria-hidden="true">
            <button
              className="cs-carousel__btn"
              onClick={() => scrollTo(Math.max(0, current - 1))}
              disabled={current === 0}
              aria-label="Previous image"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              className="cs-carousel__btn"
              onClick={() => scrollTo(Math.min(total - 1, current + 1))}
              disabled={current === total - 1}
              aria-label="Next image"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="cs-carousel__dots" role="tablist" aria-label="Image slides">
            {images.map((_, i) => (
              <button
                key={i}
                className={`cs-carousel__dot${i === current ? ' cs-carousel__dot--active' : ''}`}
                onClick={() => scrollTo(i)}
                role="tab"
                aria-selected={i === current}
                aria-label={`Image ${i + 1} of ${total}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CaseStudyImage({ image, images, carousel, alt, className = '', ratio = '16/9' }) {
  const [hasError, setHasError] = useState(false);

  if (carousel && images?.length > 0) {
    return <PhaseCarousel images={images} className={className} />;
  }

  const imageAlt = image?.alt || alt || '';

  if (!image?.src || hasError) {
    return <ImagePlaceholder alt={imageAlt} className={className} ratio={ratio} />;
  }

  return (
    <figure className={`cs-image ${className}`} style={{ aspectRatio: ratio }}>
      <img src={image.src} alt={imageAlt} loading="lazy" onError={() => setHasError(true)} />
    </figure>
  );
}

const CaseStudy = () => {
  const { slug } = useParams();
  const containerRef = useScrollReveal();
  const cs = caseStudies[slug];

  const seoTitle = cs
    ? cs.seo.title
    : 'Case Study Not Found | That Software House';

  const seoDescription = cs
    ? cs.seo.description
    : 'The case study you are looking for does not exist.';

  const seoUrl = cs
    ? cs.seo.canonicalUrl
    : 'https://thatsoftwarehouse.com/work';

  const structuredData = cs
    ? {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://thatsoftwarehouse.com',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Work',
                item: 'https://thatsoftwarehouse.com/work',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: cs.client,
                item: cs.seo.canonicalUrl,
              },
            ],
          },
          {
            '@type': 'Article',
            headline: cs.seo.title,
            description: cs.seo.description,
            author: {
              '@type': 'Organization',
              name: 'That Software House',
              url: 'https://thatsoftwarehouse.com',
            },
            publisher: {
              '@type': 'Organization',
              name: 'That Software House',
              url: 'https://thatsoftwarehouse.com',
            },
            datePublished: `${cs.year}-01-01`,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': cs.seo.canonicalUrl,
            },
          },
        ],
      }
    : null;

  useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: cs?.seo.keywords || '',
    canonicalUrl: seoUrl,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'article',
      url: seoUrl,
    },
    structuredData,
  });

  if (!cs) {
    return (
      <div className="cs-not-found">
        <p className="cs-not-found__eyebrow">404</p>
        <h1 className="cs-not-found__heading">Case study not found.</h1>
        <Link to="/work" className="cs-not-found__link">← Back to work</Link>
      </div>
    );
  }

  return (
    <article className="cs-page" ref={containerRef}>

      {/* ── Breadcrumb ──────────────────────────────────────── */}
      <nav className="cs-breadcrumb" aria-label="Breadcrumb">
        <div className="cs-wrap">
          <ol className="cs-breadcrumb__list">
            <li><Link to="/">Home</Link></li>
            <li aria-hidden="true" className="cs-breadcrumb__sep">·</li>
            <li><Link to="/work">Work</Link></li>
            <li aria-hidden="true" className="cs-breadcrumb__sep">·</li>
            <li aria-current="page">{cs.client}</li>
          </ol>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <header className="cs-hero">
        <div className="cs-wrap">
          <div className="cs-hero__top cs-reveal">
            <span className="cs-mono cs-hero__category">{cs.category}</span>
            <span className="cs-mono cs-hero__year">{cs.year}</span>
          </div>

          <h1 className="cs-hero__name cs-reveal">{cs.client}</h1>

          <p className="cs-hero__tagline cs-reveal">{cs.tagline}</p>

          <div className="cs-hero__stats cs-reveal">
            {cs.heroStats.map((s, i) => (
              <div
                key={i}
                className={`cs-hero__stat${i < cs.heroStats.length - 1 ? ' cs-hero__stat--bordered' : ''}`}
              >
                <div className="cs-hero__stat-val">
                  {s.value}
                  {s.unit && <span className="cs-hero__stat-unit">{s.unit}</span>}
                </div>
                <div className="cs-hero__stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="cs-hero__img-wrap cs-reveal">
          <CaseStudyImage
            image={cs.heroImage}
            alt={`${cs.client} — hero visual showing final brand in use`}
            label="Hero image unavailable"
            className="cs-hero__img"
            ratio="16/9"
          />
        </div>
      </header>

      {/* ── Context strip ───────────────────────────────────── */}
      <div className="cs-context">
        <div className="cs-wrap cs-context__inner">
          {[
            { key: 'Client', val: cs.client },
            { key: 'Industry', val: cs.industry },
            { key: 'Services', val: cs.services.join(' · ') },
            { key: 'Timeline', val: cs.timeline },
          ].map((item) => (
            <div key={item.key} className="cs-context__item">
              <span className="cs-context__key cs-mono">{item.key}</span>
              <span className="cs-context__val">{item.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 01 · The Brief ──────────────────────────────────── */}
      <section className="cs-section" aria-labelledby="section-brief">
        <div className="cs-wrap">
          <div className="cs-section__head cs-reveal">
            <span className="cs-section__num" aria-hidden="true">01</span>
            <h2 className="cs-section__heading" id="section-brief">{cs.brief.heading}</h2>
          </div>

          <div className="cs-brief__grid">
            <div className="cs-brief__body cs-reveal">
              {cs.brief.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <aside className="cs-brief__aside cs-reveal">
              <blockquote className="cs-callout">
                <p>{cs.brief.callout}</p>
              </blockquote>
            </aside>
          </div>
        </div>
      </section>

      {/* ── 02 · The Challenge ──────────────────────────────── */}
      <section className="cs-section cs-section--surface" aria-labelledby="section-challenge">
        <div className="cs-wrap">
          <div className="cs-section__head cs-reveal">
            <span className="cs-section__num" aria-hidden="true">02</span>
            <h2 className="cs-section__heading" id="section-challenge">{cs.challenge.heading}</h2>
          </div>

          <p className="cs-challenge__intro cs-reveal">{cs.challenge.intro}</p>

          <div className="cs-challenge__cards cs-reveal">
            {cs.challenge.tensions.map((t, i) => (
              <div key={i} className="cs-tension">
                <h3 className="cs-tension__label">{t.label}</h3>
                <p className="cs-tension__body">{t.body}</p>
              </div>
            ))}
          </div>

          <div className="cs-needle cs-reveal">
            <span className="cs-needle__tag cs-mono">The needle to thread</span>
            <p className="cs-needle__text">{cs.challenge.needle}</p>
          </div>
        </div>
      </section>

      {/* ── 03 · Approach ───────────────────────────────────── */}
      <section className="cs-section" aria-labelledby="section-approach">
        <div className="cs-wrap">
          <div className="cs-section__head cs-reveal">
            <span className="cs-section__num" aria-hidden="true">03</span>
            <h2 className="cs-section__heading" id="section-approach">Our Approach</h2>
          </div>

          <div className="cs-phases">
            {cs.process.map((phase, i) => (
              <div key={i} className={`cs-phase cs-reveal${i % 2 === 1 ? ' cs-phase--flip' : ''}`}>
                <div className="cs-phase__bar">
                  <span className="cs-phase__num cs-mono">Phase {phase.phase}</span>
                  <span className="cs-phase__label cs-mono">{phase.label}</span>
                </div>
                <div className="cs-phase__content">
                  <div className="cs-phase__copy">
                    <h3 className="cs-phase__heading">{phase.heading}</h3>
                    <p className="cs-phase__body">{phase.body}</p>
                  </div>
                  <CaseStudyImage
                    image={phase.image}
                    images={phase.images}
                    carousel={phase.carousel}
                    alt={phase.image?.alt}
                    className="cs-phase__img"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 04 · Outcomes (dark) ────────────────────────────── */}
      <section className="cs-section cs-outcomes" aria-labelledby="section-outcomes">
        <div className="cs-wrap">
          <div className="cs-section__head cs-section__head--dark cs-reveal">
            <span className="cs-section__num cs-section__num--dark" aria-hidden="true">04</span>
            <h2
              className="cs-section__heading cs-section__heading--dark"
              id="section-outcomes"
            >
              {cs.outcomes.heading}
            </h2>
          </div>

          <p className="cs-outcomes__sub cs-reveal">{cs.outcomes.subheading}</p>

          <div className="cs-metrics cs-reveal">
            {cs.outcomes.metrics.map((m, i) => (
              <div key={i} className="cs-metric">
                <div className="cs-metric__val">{m.value}</div>
                <div className="cs-metric__label cs-mono">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="cs-outcomes__img cs-reveal">
          {cs.outcomes.carousel && cs.outcomes.images?.length > 0 ? (
            <CaseStudyImage images={cs.outcomes.images} carousel ratio="16/9" />
          ) : (
            (cs.outcomes.images?.length ? cs.outcomes.images : [null]).map((image, index) => (
              <CaseStudyImage
                key={image?.src || index}
                image={image}
                alt={image?.alt}
                ratio="16/9"
              />
            ))
          )}
        </div>
      </section>

      {/* ── Testimonial ─────────────────────────────────────── */}
      {cs.testimonial && (
        <section className="cs-testimonial" aria-label="Client testimonial">
          <div className="cs-wrap">
            <div className="cs-testimonial__inner cs-reveal">
              <span className="cs-testimonial__mark" aria-hidden="true">&ldquo;</span>
              <blockquote className="cs-testimonial__quote">
                <p>{cs.testimonial.quote}</p>
                <footer>
                  <cite className="cs-testimonial__attr">
                    {cs.testimonial.author}
                    {cs.testimonial.company && (
                      <span className="cs-testimonial__company">, {cs.testimonial.company}</span>
                    )}
                  </cite>
                </footer>
              </blockquote>
            </div>
          </div>
        </section>
      )}

      {/* ── Deliverables ────────────────────────────────────── */}
      <section className="cs-section cs-deliverables" aria-labelledby="section-deliverables">
        <div className="cs-wrap">
          <h2
            className="cs-deliverables__heading cs-reveal"
            id="section-deliverables"
          >
            What we delivered
          </h2>

          <div className="cs-deliverables__table cs-reveal" role="list">
            {cs.deliverables.map((d, i) => (
              <div key={i} className="cs-row" role="listitem">
                <div className="cs-row__item">{d.item}</div>
                <div className="cs-row__detail">{d.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="cs-cta" aria-label="Start a project with TSH">
        <div className="cs-wrap">
          <div className="cs-cta__inner cs-reveal">
            <div className="cs-cta__copy">
              <p className="cs-cta__eyebrow cs-mono">Ready to build?</p>
              <h2 className="cs-cta__heading">Your project could be next.</h2>
              <p className="cs-cta__body">
                We keep 2 slots open per quarter for engagements like this. Senior team, no junior
                proxies, no radio silence. If you need something built right — let's talk.
              </p>
            </div>
            <div className="cs-cta__actions">
              <Link to="/contact" className="cta-btn cta-btn--primary">
                Start a conversation ↗
              </Link>
              <Link to="/work" className="cta-btn cta-btn--secondary-dark">
                See more work
              </Link>
            </div>
          </div>
        </div>
      </section>

    </article>
  );
};

export default CaseStudy;
