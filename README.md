# Skyline Drones — v2 (A/B preview)

Premium rebuild of skylinedronesph.com. Two design directions for review.

## Structure

```
/                — A/B picker landing page
/variant-a/      — The Evolution (refined cinematic polish on familiar layout)
/variant-b/      — The Reinvention (editorial agency rebuild, oversized display)
/styles/         — Shared design tokens + components
/scripts/        — Shared Lenis smooth scroll + reveals + magnetic CTAs
/assets/         — Logo, hero video, firefighting scenario imagery
```

## Stack

Static HTML + CSS + vanilla JS · Lenis smooth scroll · IntersectionObserver reveals · FormSubmit

## Local preview

```
python3 -m http.server 8080
```

Then open <http://localhost:8080>.

## Deploy

Static site — point any host (Render, Vercel, Netlify, Cloudflare Pages, S3) at the repo root with `index.html` as the entry. No build step.

## Contact

skylinedrones.ph@gmail.com — wired into the forms via FormSubmit.
