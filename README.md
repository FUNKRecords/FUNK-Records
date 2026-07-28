# FUNK UNIVERSE

Website for **FUNK UNIVERSE**, an independent record label — a static site served by
GitHub Pages at **[funkuniverserecords.com](https://funkuniverserecords.com)**.

No build step, no dependencies. Edit the HTML, commit, push.

## Pages

| File | URL | Purpose |
|---|---|---|
| `index.html` | `/` | Home — hero, services, submit CTA, legal |
| `submit-demo.html` | `/submit-demo.html` | Demo submission form |
| `start-your-label.html` | `/start-your-label.html` | Label infrastructure offering |
| `label-application.html` | `/label-application.html` | Label setup application form (`noindex`) |
| `support.html` | `/support.html` | FAQ + contact form |
| `404.html` | any unknown URL | Not-found page (GitHub Pages serves this automatically) |

## Shared code

Every page pulls the same two files, so a change lands everywhere at once:

- **`assets/site.css`** — design tokens, nav, drawer, buttons, form fields,
  footer, scroll-reveal, focus states, responsive rules.
- **`assets/site.js`** — custom cursor, mobile drawer (focus trap included),
  scroll reveal, current-page highlighting, and the `window.FU` form helpers
  (`markInvalid`, `watchFields`, `setStatus`, `isEmail`, `isUrl`, …).
- **`cookie.js`** — the cookie consent banner, injected on content pages.

Page-specific styles stay in a `<style>` block on the page itself.

### Design tokens

Colours, fonts and spacing come from CSS custom properties in `:root`
(`assets/site.css`). Change `--bg`, `--white`, `--muted` etc. there rather than
hard-coding values in a page.

## Site files

| File | Purpose |
|---|---|
| `CNAME` | Custom domain for GitHub Pages — **do not delete** |
| `robots.txt` | Crawl rules + sitemap pointer |
| `sitemap.xml` | Indexed URLs — **add new pages here** |
| `site.webmanifest` | PWA/install metadata |
| `favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | Icon set (an "FU" monogram, which stays legible at 16px) |
| `og-image.jpg` | 1200×630 social sharing preview |

## Images

| File | Used for |
|---|---|
| `logo.webp` | Hero logo (served first via `<picture>`) |
| `logo.png` | Hero logo fallback for browsers without WebP |
| `logo-160.png` | Footer logo (rendered at 80px, so 160px covers 2× displays) |

The source artwork is 1024×1024. If you replace the logo, regenerate every
variant and the icon set — do not point the footer at the full-size file.

## Forms

Three forms, all client-side, all posting to third-party services:

| Form | Service | Endpoint / template |
|---|---|---|
| Demo submission | EmailJS (auto-reply) + Formspree (storage) | `template_hq0q2bb` / `f/mzzrkpqj` |
| Contact | Formspree | `f/mwvwgegn` |
| Label application | EmailJS | `template_2to2ts6` |

The EmailJS public key and Formspree IDs are in the page source. That is
expected — they are public-by-design identifiers, not secrets — but it means
rate limiting and spam filtering are the providers' responsibility. Each form
carries a honeypot field to shed the simplest bots.

Validation is client-side and inline: fields turn red with a message underneath,
and focus jumps to the first problem. There are no `alert()` dialogs.

## Adding a page

1. Copy the `<head>`, nav, drawer and footer from an existing page.
2. Update `<title>`, `<meta name="description">`, `<link rel="canonical">` and
   the `og:`/`twitter:` tags.
3. Add the page to `sitemap.xml` and to the nav, drawer and footer link lists.

## Local preview

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Root-relative paths (`/assets/…` in `404.html`) need a server — opening the
files directly with `file://` will not resolve them.
