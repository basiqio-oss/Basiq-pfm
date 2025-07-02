# Basiq PFM

A modern Personal Finance Management (PFM) web application built with Next.js, React, Tailwind CSS, and Radix UI. This project provides a dashboard for users to manage accounts, view transactions, track budgets, and generate financial reports using Basiq API integrations.

## Features
- Next.js 15 app directory structure
- User authentication and dashboard
- Account, transaction, and report management
- Responsive UI with Tailwind CSS and Radix UI components
- Job polling, loaders, and onboarding flows

## Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd Basiq-pfm
```

### 2. API key setup
If you haven't already, Sign-up to the Basiq API service and grab your API key for your application (via the Developer Dashboard).

⚠️ Don't forget to configure your dashboard appropriately - especially your redirect URL. Read more about that here.

Once you have a Basiq API key, move the sample .env.sample file to .env.local and paste in your Basiq API key next to BASIQ_API_KEY=

```bash
mv .env.sample .env.local
# BASIQ_API_KEY=
# + BASIQ_API_KEY=abc123
```

### 3. Install dependencies
Install dependencies with yarn. If you don't have this installed, please read their installation guide for detailed instructions.

```bash
yarn
```

### 4. Start the development server
```bash
yarn dev
```
🎉 You should now see the website running at http://localhost:3000

## Scripts
- `yarn run dev` — Start the development server
- `yarn run build` — Build for production
- `yarn run start` — Start the production server
- `yarn run lint` — Lint the codebase

## Tech Stack
- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Basiq API](https://basiq.io/)

## Folder Structure
- `app/` — Application routes, API endpoints, and pages
- `components/` — Reusable UI and feature components
- `hooks/` — Custom React hooks
- `lib/` — Utility libraries and API helpers
- `public/` — Static assets
- `styles/` — Global styles

## License
This project is licensed under the MIT License.
