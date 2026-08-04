# TravelEnfield

TravelEnfield is a Next.js App Router application styled with Tailwind CSS and the established TravelEnfield responsive stylesheet. MongoDB is accessed through Mongoose from Next.js Route Handlers.

## Local development

1. Copy `.env.example` to `.env.local` and add the MongoDB connection string.
2. Install dependencies with `npm install`.
3. Run the application with `npm run dev`.

The website and API run together on `http://localhost:3000`.

## Project structure

```text
.
|-- app/                   Next.js pages, layouts and API Route Handlers
|-- components/            React client compatibility components
|-- lib/                   Cached MongoDB connection and migration helpers
|-- index.html             Temporary homepage source markup bridge
|-- app.html               Temporary internal-page source markup bridge
|-- server/models.js       Mongoose schemas (collection names preserved)
|-- server/seed.js         Explicit, manual-only seed command
|-- src/scripts/           Existing interactions during component migration
|-- src/styles/            Existing responsive styles preserved during migration
|-- public/images/         Optimised public image assets
|-- postcss.config.mjs     Tailwind CSS integration
|-- next.config.mjs        Next.js production settings
`-- vercel.json            Vercel Next.js settings
```

The two HTML files are read by server components to preserve the verified layout while old DOM sections are progressively extracted into React components. They are source templates, not browser entry points. This compatibility bridge avoids a visual big-bang rewrite.

## Database safety

- The migration does not drop, rename, seed, or overwrite MongoDB collections.
- Runtime writes are limited to explicit enquiry, signup, and login API flows.
- Mongoose uses a cached connection suitable for Next.js hot reload and serverless runtimes.
- `npm run seed` is manual and must not be run against production without reviewing `server/seed.js`.
- Keep `MONGODB_URI` only in `.env.local` or the Vercel environment; never commit it.

## Production checks

```bash
npm run build
npm start
```

Do not commit `.env`, database credentials, audit screenshots, `.next`, or `node_modules`. New UI work should be React components with Tailwind utilities; the compatibility bridge can be reduced section by section without changing public routes or database schemas.
