# Senveora website

Static website for Senveora, deployed on Vercel.

- `index.html` is the home page; `about`, `services`, `raas` (Results as a Service), `work`, `contact` and `404` pages sit alongside
- `styles.css` and `site.js` are shared by every page. The design system (ink and paper tones, Fraunces / Inter / JetBrains Mono, cobalt accent) is documented at the top of `styles.css`; add `tone-alt` or `tone-ink` to a section to change its background
- `fonts/` holds the self-hosted web fonts (all SIL Open Font License); stack logos on the home page are inline SVGs from Simple Icons (CC0)
- `og-image.png` is the social preview image used when links are shared
- The contact form posts to FormSubmit (`data-endpoint` on the form) and falls back to opening an email if that fails
- `vercel.json` enables clean URLs (`/about`), redirects `/careers` to `/work` and sets security headers
