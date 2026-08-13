<div align="center">

# 🤖 OmniAgent

### Your WhatsApp, on autopilot.

A WhatsApp automation agent that replies on your behalf — with a configurable tone, working hours, contact/group restrictions, and a personal knowledge base so it actually sounds like you.

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![gRPC](https://img.shields.io/badge/gRPC-4285F4?style=flat-square&logo=google&logoColor=white)](https://grpc.io/)
[![Groq](https://img.shields.io/badge/Groq-F55036?style=flat-square&logo=groq&logoColor=white)](https://groq.com/)
[![Qdrant](https://img.shields.io/badge/Qdrant-DC244C?style=flat-square&logo=qdrant&logoColor=white)](https://qdrant.tech/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)

</div>

---

Built as a fun side project. The agent isn't always accurate, and that's half the fun of watching it improvise mid-conversation. Fork it, connect your own WhatsApp, and play around.

## Features

- **Auto-reply engine** — generates contextual replies to incoming WhatsApp messages using an LLM
- **Tone presets** — 8 built-in personalities across two styles:
  - Casual: friendly, witty, empathetic, brief
  - Professional: formal, consultative, supportive, concise
- **Blocked contacts/groups** — restrict specific people or groups the agent should never reply to
- **Working hours** — schedule when the agent is allowed to respond
- **Knowledge base** — feed it PDFs/website content so replies are grounded in information about you
- **Web dashboard** — configure everything (tone, schedule, blocklist, KB) without touching code

## Architecture

```
┌─────────────┐        HTTP/Auth        ┌──────────────┐
│  Frontend   │ ───────────────────────▶ │              │
│  (Next.js)  │                          │              │
└─────────────┘                          │              │
                                          │              │
┌─────────────┐   WhatsApp protocol      │              │
│  WhatsApp   │◀────────────────────────▶│   Gateway    │
│  (Baileys)  │                          │  (Node.js)   │
└─────────────┘                          │              │
                                          │  - Redis     │──▶ contacts / session cache
                                          └──────┬───────┘
                                                 │ gRPC
                                                 ▼
                                          ┌──────────────┐
                                          │  Agent Core  │
                                          │  (Python)    │
                                          │              │
                                          │  - Qdrant    │──▶ knowledge base (vector search)
                                          │  - Supabase  │──▶ users, accounts, schedules
                                          │  - Groq LLM  │──▶ reply generation
                                          └──────────────┘
```

1. **Gateway** connects to WhatsApp via Baileys, caches contacts/chat state in Redis, and forwards incoming messages to Agent Core over gRPC.
2. **Agent Core** checks working-hours and blocklist rules, retrieves relevant knowledge-base context from Qdrant, builds a prompt using the selected tone, and calls Groq's LLM API to generate a reply.
3. The reply flows back over gRPC to the Gateway, which sends it out through the same WhatsApp socket.
4. **Frontend** is the control panel for tone, contacts, schedule, and knowledge base — all backed by Supabase.

## Tech Stack

| Layer | Tech |
|---|---|
| WhatsApp connectivity | [Baileys](https://github.com/WhiskeySockets/Baileys) |
| Gateway | Node.js, Express |
| Agent Core | Python, FastAPI |
| Inter-service communication | gRPC ([`omniagent.proto`](backend/proto/omniagent.proto)) |
| Frontend | Next.js, React, Tailwind CSS |
| Reply generation | [Groq](https://groq.com/) LLM API |
| Vector search (knowledge base) | Qdrant |
| Relational data (users, accounts, schedules) | Supabase (Postgres) |
| Cache / session state | Redis |

## Project Structure

```
OmniAgent/
├── backend/
│   ├── agent-core/       # Python service: AI reply generation, gRPC server, DB access
│   │   ├── ai/           # Tone prompts + LLM handler
│   │   ├── db/           # Qdrant + Supabase clients
│   │   ├── knowledge_based/  # PDF/website ingestion for the knowledge base
│   │   ├── messaging/    # Incoming message handling
│   │   └── rpc/          # gRPC server + generated stubs
│   ├── gateways/         # Node.js service: WhatsApp (Baileys) + Telegram gateways
│   │   ├── whatshapp/    # WhatsApp connection, routes, gRPC client
│   │   ├── messaging/    # Message processing pipeline
│   │   └── db/           # Redis client
│   ├── proto/            # Shared gRPC contract (omniagent.proto)
│   └── docker-compose.yml
└── frontend/              # Next.js dashboard (tone, contacts, schedule, knowledge base)
```

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- Node.js 18+ (for the frontend, or if running the gateway outside Docker)
- Accounts/API keys for: [Supabase](https://supabase.com/), [Qdrant](https://qdrant.tech/) (cloud or self-hosted), [Groq](https://groq.com/)

### 1. Backend (Gateway + Agent Core + Redis)

Create `backend/agent-core/.env`:

```env
SUPABASE_URL=
SUPABASE_KEY=
DATABASE_URL=            # Supabase Postgres connection string
Qdrant_APIURL=
Qdrant_APIKEY=
GROQ_API_KEY=
GOOGLE_CLIENT_ID=        # if using Google OAuth on the frontend
```

Create `backend/gateways/.env` (Redis/agent-core addresses are already wired via `docker-compose.yml`; add any gateway-specific secrets here).

Then, from `backend/`:

```bash
docker compose up --build
```

This starts:
- `omniagent-redis` — Redis on `:6379`
- `agent-core` — FastAPI on `:8000`, gRPC on `:50051`
- `gateways` — WhatsApp/Telegram gateway on `:3000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — note the frontend and gateway both default to port 3000, so adjust ports in `docker-compose.yml` or `.env` if running both locally at once.

## Contributing

This started as a joke project and turned into a decent excuse to play with agent orchestration, gRPC, and real-time messaging pipelines. Issues, PRs, and forks are welcome — especially if you make the agent funnier (or more accurate).
