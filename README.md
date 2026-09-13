# Young Einsteins Website

Website for Young Einsteins tutoring, built with Vite, Tailwind CSS, and an
EN/VI language toggle. Deployed as a static build to GitHub Pages at
[youngeinsteins.com.au](https://youngeinsteins.com.au).

## Stack

- **Vite** - dev server, build, and HTML partials (`posthtml-include`) for
  the shared nav/footer
- **Tailwind CSS v4** - all styling, via `@tailwindcss/vite`
- **Vanilla JS** - mobile nav, scroll-reveal animation, EN/VI language
  toggle, testimonial marquee, Web3Forms submission with rate limiting,
  cookie notice banner
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

## URLs

Pages are served without the `.html` extension - `/about`, not
`/about.html`. Source files keep their `.html` names. `/about/` with a
trailing slash does not resolve.

Internal links all use the clean root-relative form (`href="/about"`,
`href="/"`). Since both forms resolve, every page carries a
`<link rel="canonical">` pointing at the clean one; `404.html` carries
`<meta name="robots" content="noindex">` instead.

## Search and analytics

- **Google Analytics 4** - `src/partials/analytics.html`, included in the
  `<head>` of every page. The measurement ID appears twice in that file.
- **Search Console** - registered as a **Domain** property, verified by a
  `google-site-verification` TXT record on `youngeinsteins.com.au`. That
  record must stay in DNS; deleting it un-verifies the property.
- **`robots.txt`** allows all crawling and points at `sitemap.xml`, which
  lists the 7 indexable pages.
- **`head-assets.html`** carries the Open Graph tags and a JSON-LD block
  typed `EducationalOrganization` + `LocalBusiness` - name, phone, email,
  founding date, opening hours, service areas and social profiles. It is
  what feeds Google's rich results, and it deliberately gives the suburb
  only, never a street address as client requested.

## Local development

CI builds with Node 24.

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
    head-assets.html   favicon/fonts/stylesheet tags, Open Graph tags, JSON-LD
    analytics.html     GA4 snippet
public/
  assets/
    logo-192.png       nav, footer, and the favicon
    logo.png           full-resolution original, referenced only by the JSON-LD
    apple-touch-icon.png
    *-session.jpg      page photos
  robots.txt           allows all crawling, points at the sitemap
  sitemap.xml          the 7 indexable pages (404 deliberately excluded)
  CNAME                custom domain for GitHub Pages
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

## Testimonial marquee

`src/js/reviews.js` holds 42 testimonials at the moment and renders `VISIBLE_COUNT` (20)
of them at random per page load and duplicates them so the loop is seamless.

Two constraints, both from iPhone Safari, both easy to undo by accident:

- Raising `VISIBLE_COUNT` much past 20 pushes the track back over ~25,000px,
  which iOS won't render as a single animated layer - the section comes out
  as an empty blue band.
- The animation belongs on `.marquee-track.is-scrolling`, added by JS after
  `innerHTML`. Put it on `.marquee-track` in CSS and it starts against a 0px
  track and sits frozen until a reload.

`150s` is tuned to 20 cards. Change the count and it needs adjusting.

## Contact form

- Fields: student's full name, parent/guardian name, student year level,
  mobile, email, subject needed, lesson type, comments, plus an ATAR
  subject dropdown that stays hidden until ATAR is chosen.
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

## Constraints

Things that are deliberate, or that can't be changed without changing the
hosting model:

- **Only English is indexable.** The language toggle swaps text client-side
  and remembers the choice in `localStorage`. Every page has one URL - there
  are no `/vi/` paths and no `hreflang` tags - so search engines index the
  English copy. Vietnamese is for visitors who are already here, not for
  being found in Vietnamese search.
- **No street address anywhere.** The business runs from a private
  residence. The site gives "Dianella, WA 6059" only, in the JSON-LD and in
  the copy. Keep it that way.
- **No prices.** Not on any page, by choice.
- **No backend.** Enquiries go to Web3Forms; there is no database, no login,
  and nothing server-side to attack. The Web3Forms access key is public in
  the page source - it has to be, and that is how the service is designed.
- **No response headers.** GitHub Pages serves static files and can't set
  things like a Content-Security-Policy, so `<meta>` equivalents are the
  only option.
- **Deploys only on push to `main`.** There is no staging environment; test
  with `npm run preview` before merging.

## Free-tier limits

- Web3Forms Free: 250 submissions/month. Beyond that, submissions are
  rejected until the month resets - the form then shows its fallback
  message with the phone number, rather than failing silently.
- GitHub Pages: 100 GB/month bandwidth, 10 builds/hour, 1 GB published size
