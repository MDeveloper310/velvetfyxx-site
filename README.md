# Maria Marron — Velvet Fyxx · Website

Static, dependency-free portfolio + living media kit. Pure HTML / CSS / vanilla JS. No build step.

```
index.html  about.html  work.html  services.html  contact.html  404.html
css/styles.css     # all styling; brand colors as CSS variables in :root
js/main.js         # sticky nav, mobile menu, reveal-on-scroll, work filters, form, footer year
assets/img/        # optimized .webp (600w + 1200w), og.jpg (1200×628), hero jpg fallback
assets/video/      # hilton-stay.mp4 (muted 12s loop, 540p, ~1.3 MB)
assets/favicon.svg, favicon-32.png, apple-touch-icon.png
assets/Maria-Marron-Media-Kit.pdf   # downloadable media kit
.nojekyll
```

## Deploy to GitHub Pages
1. Create a repo (e.g. `velvetfyxx-site`) and push the contents of this folder to `main` (files at repo root).
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)` → Save.
3. Site goes live at `https://<username>.github.io/velvetfyxx-site/` in ~1 minute.
4. Custom domain (recommended): add a `CNAME` file containing e.g. `mariamarron.com`, point DNS (4 A records to GitHub Pages IPs or a CNAME to `<username>.github.io`), then tick **Enforce HTTPS**.

## What to swap
| Item | Where |
|---|---|
| **Formspree endpoint** — create a free form at formspree.io, replace `YOUR_FORM_ID` | `contact.html` (form `action`). Until swapped, submit opens a pre-filled email to mariamarronbusiness@gmail.com (mailto fallback). |
| **Site URL / domain** — `https://mariamarron.com` | `<link rel=canonical>`, `og:url`, `og:image` in every page (find & replace). |
| **404 paths** — 404.html uses root-absolute `/...` links (custom domain mariamarron.com) | `404.html` |
| **Media kit PDF** — linked from the homepage, contact page and every footer | `assets/Maria-Marron-Media-Kit.pdf` (replace the file, keep the name) |
| **Real photos** — current images are the brand-kit/Dropbox media-kit finals (branded promo graphics). Add clean, unbranded stills per brand. | `assets/img/<name>-600.webp` + `-1200.webp` (keep names, or edit `work.html`). |
| Social links (verify handles) | footer of every page + `contact.html` + JSON-LD |

To regenerate images: `cwebp -q 78 -resize 1200 0 in.jpg -o name-1200.webp` (and 600).

## Brand-kit gaps (flagged)
- No logo/monogram file — wordmark is set in Bodoni Moda caps; favicon "MM" is a placeholder.
- No audience stats, demographics, reach, or engagement (intentionally not shown).
- No case-study results, briefs, or deliverable counts per brand.
- No testimonials / client quotes.
- No brand logos (brands are listed typographically).
- No unbranded per-brand photography; kit images carry the restaurants' own promo text.
- No rates sheet (the site deliberately mentions no rates or prices), no usage/licensing terms, no turnaround times.
- No domain, no Formspree account, no headshot/portrait for press, no showreel (a Hilton reel clip from Dropbox is used).
- "Frymazing" — approved by Maria to keep.
