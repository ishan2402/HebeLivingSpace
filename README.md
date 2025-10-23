# Hebe LivingSpace - Starter E-marketplace

Tagline: Enhancing Everyday Living Spaces

This is a ready-to-deploy static starter for Hebe LivingSpace — a small e-marketplace for lifestyle, gardening, and storage products.
It includes:
- Responsive `index.html`, `styles.css`, and `script.js`
- `products.json` for the product catalog (editable)
- `config.json` to change WhatsApp number and brand without editing JS
- Netlify CMS config (admin/config.yml) for easy in-browser editing when hosted on Netlify
- Placeholder SVG images under `images/` and logos

## Quick deploy options

### GitHub Pages (fast)
1. Push the repository to GitHub.
2. In your repo Settings → Pages → Source = `main` / root.
3. The site will be available at `https://<username>.github.io/<repo>/`.

### Netlify (recommended if you want CMS)
1. Create a Netlify site and connect this repo.
2. Enable Identity and Git Gateway in Netlify settings to allow Netlify CMS (see Netlify docs).
3. Visit `https://<yoursite>/admin` to use Netlify CMS.

## WhatsApp
Change your WhatsApp number easily in `config.json` (set WA_PHONE to country code + number, e.g., 919812345678).
