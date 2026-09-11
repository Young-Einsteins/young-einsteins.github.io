# Young Einsteins Website

Website for Young Einsteins tutoring, built with Vite, Tailwind CSS, and an
EN/VI language toggle. Deployed as a static build to GitHub Pages at
[youngeinsteins.com.au](https://youngeinsteins.com.au).

## Stack

- **Vite** - dev server, build, and HTML partials (`posthtml-include`) for
  the shared nav/footer
- **Tailwind CSS v4** - all styling, via `@tailwindcss/vite`
- **Vanilla JS** - mobile nav, scroll-reveal animation, EN/VI language
  toggle, Web3Forms submission with rate limiting, cookie notice banner
- **Web3Forms** - contact form delivery, no backend required
- **Google Analytics 4** - visitor analytics
- **ESLint + Prettier** - linting and formatting
- Hosting: **GitHub Pages**, built and deployed via GitHub Actions

## Pages

`index.html`, `about.html`, `subjects.html`, `masterclasses.html`,
`contact.html`, `privacy.html`, `terms.html`, `404.html`.

`subjects.html` covers both subjects offered and current session times (no
prices are listed anywhere on the site). `privacy.html` and `terms.html` are
fully translated and work with the language toggle like every other page.

## Local development

```bash
npm install
npm run dev       # dev server with hot reload
npm run build     # production build to ./dist
npm run preview   # preview the production build locally
npm run lint      # ESLint
npm run format    # Prettier, writes formatting fixes
```

## Folder structure

```
src/
  css/main.css        Tailwind entry + custom component/animation styles
  js/
    translations.js   EN/VI text dictionary (all copy lives here)
    i18n.js            translate() / applyLanguage() / language toggle wiring
    form.js            contact form validation, rate limiting, Web3Forms submit
    reviews.js         testimonial data + renders the homepage marquee
    cookie-banner.js   cookie notice banner
    main.js            entry point - wires up nav, reveal animation, i18n, form, banner
  partials/
    nav.html           shared header/nav, included on every page
    footer.html        shared footer, included on every page
    head-assets.html   shared favicon/fonts/stylesheet <head> tags
    analytics.html     GA4 snippet
public/assets/          logo and page images, served as-is
```

Shared partials are included via `<include src="src/partials/...">` tags
(`posthtml-include`, wired into Vite through a small custom plugin in
`vite.config.js`). Each page sets `<body data-page="...">` so
`src/js/main.js` can highlight the matching nav link at runtime, since the
nav partial itself is identical on every page.

## Language toggle

`src/js/translations.js` holds every translatable string as
`{ key: { en, vi } }`. Elements needing translation carry `data-i18n="key"`.
On load and on toggle, `applyLanguage()` (in `src/js/i18n.js`) walks those
elements, swaps text, updates `<html lang>`, and persists the choice to
`localStorage` so it survives navigating between pages.

## Contact form

- Fields: student's full name, parent/guardian name, student year level,
  mobile, email, subject needed, lesson type, comments.
- A hidden `botcheck` checkbox is included for Web3Forms' spam filtering.
- Submissions post to `https://api.web3forms.com/submit` via `fetch`.
- **Rate limiting**: after a successful send, the timestamp is stored in
  `localStorage`; a resubmission within 15 minutes is blocked with a
  user-facing message instead of being sent again. The submit button is also
  disabled immediately on click to prevent double-submits.
- If the access key is missing or the request fails, the same fallback
  message directs people to call or email directly - the form never fails
  silently.

## Cookie notice

A dismissible bottom banner (`src/js/cookie-banner.js`) tells visitors the
site uses Google Analytics. Dismissal is stored in `localStorage` so it
doesn't reappear. It's a polite Australian-context notice, not a GDPR
consent wall, and is translated via the same EN/VI system as the rest of the
site.

## GitHub Pages deployment

`.github/workflows/deploy.yml` builds the site with `npm ci && npm run build`
and publishes `./dist` via `actions/deploy-pages` on every push to `main`.
Pages is configured with **Settings -> Pages -> Source** set to **GitHub
Actions** (not "Deploy from branch"), and the custom domain
`youngeinsteins.com.au` is set there with "Enforce HTTPS" enabled.

## Free-tier limits

- Web3Forms Free: 250 submissions/month
- GitHub Pages: 100 GB/month bandwidth, 10 builds/hour, 1 GB published size
