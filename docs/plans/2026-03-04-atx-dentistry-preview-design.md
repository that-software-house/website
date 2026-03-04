# ATX Dentistry Preview Design

## Goal

Create a brand new standalone preview experience at `/atx-dentistry` that modernizes [atxfamilydentistry.com](https://atxfamilydentistry.com) while keeping the real business facts intact.

## Inputs Collected

- Business name: Austin Dental Specialty Group
- Location: 5000 Davis Ln Ste 101, Austin, TX 78749
- Contact: `(512) 717-0989`, `info@atxfamilydentistry.com`
- Positioning: South Austin family, cosmetic, implant, restorative, and specialty dentistry
- Doctors: Dr. Sarah Behmanesh and Dr. Chelsea Brossart
- Key service themes: preventive care, family dentistry, cosmetic dentistry, implant restoration, oral surgery, orthodontics
- Trust themes from live site: comfort-first visits, same-day emergency care, modern imaging/technology, insurance and financing support
- New-patient messaging: no guilt, clear treatment plans, comfort and emotional safety

## Chosen Direction

- Standalone preview page, not wrapped in the global TSH header/footer/chat shell
- Stronger agency-style redesign with a calm boutique-healthcare visual system
- Non-functional CTAs that look real but only scroll or link to placeholders
- Real business facts preserved, with tighter patient-facing copy and cleaner hierarchy

## Experience Structure

1. Transparent nav over hero
2. Editorial hero with dual dummy CTAs and local trust cues
3. Trust/value strip
4. Service grid
5. Doctor spotlight
6. Anxiety-friendly comfort section
7. Patient feedback themes
8. First-visit timeline
9. Insurance and financing section
10. FAQ
11. Contact/footer with preview watermark
12. Sticky mobile CTA rail

## Implementation Notes

- Add a dedicated preview page component and route at `/atx-dentistry`
- Update app layout logic so this route bypasses the shared `Header`, `Footer`, and `ChatWidget`
- Keep styling route-scoped to avoid regressions elsewhere
- Use existing dependencies only: React, framer-motion, lucide-react
- Validate with `npm run lint` and `npm run build`

## Quality Bar

- Mobile-first, no horizontal overflow
- Clear tap targets and accessible contrast
- Dummy CTAs only, no real submission behavior
- Easy to evolve into a reusable preview pattern for future prospect pages
