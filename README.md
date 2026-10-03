# Senveora website

Static website for Senveora, deployed on Vercel.

- `index.html` is the home page; `about`, `services`, `raas` (Results as a Service), `work`, `contact` and `404` pages sit alongside
- `styles.css` and `site.js` are shared by every page except the home page, which uses `home.css` and `home.js`
- `visuals.css` holds the product illustrations (hero engagement panel, service visuals, flow diagrams, logos, avatars) and is loaded on every page after the main stylesheet
- `og-image.png` is the social preview image used when links are shared
- The contact form posts to FormSubmit (`data-endpoint` on the form) and falls back to opening an email if that fails
- `vercel.json` enables clean URLs (`/about`), redirects `/careers` to `/work` and sets security headers
