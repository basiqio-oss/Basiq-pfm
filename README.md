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
cd Basiq-PFM-V3
```

### 2. Install dependencies
You can use `yarn`, `pnpm`, or `npm`:
```bash
yarn install
# or
pnpm install
# or
npm install
```

### 3. Configure environment variables
Copy the `.env.sample` file to `.env.local` and fill in the required values:
```bash
cp .env.sample .env.local
```
Edit `.env.local` with your Basiq API keys and other secrets.

### 4. Run the development server
```bash
yarn run dev
# or
pnpm dev
# or
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

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
