# Real-Time WhatsApp Lead Bot

A Next.js dashboard that receives inbound **WhatsApp** messages through Meta
webhooks, qualifies each lead with AI (budget, type, location, score), and replies
to the prospect in seconds. Every lead lands in a live dashboard with filters and
statuses.

## How it works
```
WhatsApp message ──► Meta webhook ──► /api/webhooks/whatsapp
                                          │
                                          ├─ AI qualification (Claude) ─► score + fields
                                          ├─ store lead
                                          └─ auto-reply to prospect
                                                   │
Dashboard (/) ◄── /api/leads ◄────────────────────┘
```
- `app/api/webhooks/whatsapp/route.ts` — inbound webhook handler (verify + receive).
- `app/api/leads/route.ts` — leads API for the dashboard.
- `lib/whatsapp.ts` — WhatsApp Business API client.
- `lib/claude.ts` — LLM qualification.
- `lib/storage.ts` — lead persistence.
- `app/page.tsx` — live dashboard (filters, statuses).

## Stack
Next.js · TypeScript · Claude API · WhatsApp Business API (Meta webhooks)

## Run
```bash
npm install
cp .env.example .env.local   # add your own keys
npm run dev
```

## Notes
- No secrets or lead data committed (`.env*` and `data/` are gitignored).
- Built and deployed on VPS with real-time webhook handling.
