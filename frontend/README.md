# OmniAgent — Frontend

Next.js dashboard for configuring the OmniAgent WhatsApp automation agent: tone, blocked contacts, working hours, and knowledge base.

For the full project overview, architecture, and backend setup, see the [root README](../README.md).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard. The backend (`agent-core` + `gateways`) must be running separately — see the [backend setup](../README.md#getting-started).

## Structure

- `app/whatsapp-agent/` — dashboard pages: `tone/`, `blocked-contacts/`, `working-time/`, `knowledge-base/`, `settings/`
- `app/api/auth/` — authentication (NextAuth)
- `components/` — shared UI components
- `lib/` — client utilities

## Stack

Next.js, React, Tailwind CSS, NextAuth.
