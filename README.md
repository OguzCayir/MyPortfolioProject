# Oguz Kagan Cayir – Portfolio

Personal site of Oguz Kagan Cayir, final-year BSc Computer Science (Artificial Intelligence) student at Brunel
University London, researching demand forecasting and multi-objective routing optimisation for delivery logistics.

**Live:** https://oguzcayir.github.io/

## What's on the site

- **Live demo:** a small NSGA-II-style optimiser runs in the browser on a toy delivery problem. Click (or use the arrow
  keys on) the Pareto front to see the routes for each trade-off. It is illustrative only, not dissertation results.
- **Research:** the dissertation, *Adaptive Regime-aware Algorithm Selection for Multi-objective Delivery Routing
  with Demand Forecasting*, plus modules and AI coursework.
- **Route map:** the path from operations (Getir, Yango, Yep!, Rudy's Vegan, Bibi's) to Computer Science at Brunel.
- **Projects, skills, outside work and contact.**
- **Command palette:** press `Ctrl K` / `⌘K` or `/` to jump to any section.

## Tech

Plain HTML, CSS and JavaScript, with no framework, no build step and no dependencies.

- Canvas 2D for the demo and inline SVG for the route map
- Self-hosted Instrument Serif font (SIL Open Font License) and WebP images
- Respects `prefers-reduced-motion`; keyboard accessible
- Lighthouse 100 / 100 / 100 / 100 on mobile and desktop at the time of publishing

## Structure

```
index.html        the page
Oguz-Kagan-Cayir-CV.pdf  downloadable CV (web copy, no phone number)
style.css         styles
lab.js            live Pareto-front routing demo
palette.js        Ctrl/⌘K command palette
img/              optimised images and social share image (og.jpg)
fonts/            Instrument Serif (latin subset)
resources/images/ original photos
legacy/           previous version of the site (not indexed)
```

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

GitHub Pages serves the `main` branch from the repository root (user site: this repo is named `OguzCayir.github.io`).

## Contact

[Email](mailto:oguzcayir99@gmail.com) · [LinkedIn](https://www.linkedin.com/in/oguz-kagan-cayir/) · [GitHub](https://github.com/OguzCayir)
