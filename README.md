# Wohnungsplanung

A private progressive web app for a two-person household. It covers the everyday logistics of sharing an apartment: a shared shopping list, split tracking for purchases, a pantry inventory, and a recipe collection that knows what is currently in stock.

## Features

- **Shopping list** — shared list; items can be grouped by category and checked off while shopping
- **Purchases & expense split** — log purchases, assign who paid, and keep a running balance between the two household members
- **Pantry** — track what is in stock at home, including quantities
- **Recipes** — store recipes with ingredients; cookability is derived from the current pantry contents
- **PWA** — installable on the home screen, offline fallback page, native-feeling UI with safe-area support for iOS
- **Per-user accent colors** — each member gets their own accent color throughout the app

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Server Actions)
- TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Supabase](https://supabase.com) (Postgres, Auth)
- lucide-react icons
- Service worker + web app manifest (PWA)

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local
# then fill in the Supabase URL and publishable key

# 3. Start the dev server
npm run dev
```

The app is then available at [http://localhost:3000](http://localhost:3000).

### Useful scripts

| Script          | Purpose                      |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the development server |
| `npm run build` | Create a production build    |
| `npm run start` | Serve the production build   |
| `npm run lint`  | Run ESLint                   |

## Deployment

The app runs as a Docker container on a VPS behind [Caddy](https://caddyserver.com), which handles TLS termination and reverse proxying. Deployment is automated: every push to `main` triggers a GitHub Actions workflow that builds the image and rolls it out to the server.

## Notes

This is a private project and not intended for public use. There is no public sign-up; accounts are provisioned manually in Supabase.
