# Cardimus

AI-powered business card scanner, built mobile-first. Take a photo of a card (or pick one from the gallery), an AI vision model reads it, you review and correct the result, and Cardimus syncs it to HubSpot as a contact.

Built as an internal company tool: login is required and every user only sees their own scans.

## Features

- **Scan** with the phone camera or the photo gallery. Images are resized in the browser before upload.
- **AI extraction** of name, title, company, email, phone, mobile, website, address, city, country, LinkedIn and notes. Providers: **Google Gemini** or **Anthropic Claude** (switch with `AI_PROVIDER`).
- **International phone numbers**: the AI adds the dial code when the card doesn't print one, and flags it so you can double-check.
- **Country dropdown** (searchable). The AI's country is matched to the list in `lib/countries.ts`; the list's 2-letter code is what HubSpot receives.
- **Details page** right after a scan: every field is editable, with a **Rescan** option to read the card again (replaces the result), plus Save, Add to contacts and Push to HubSpot.
- **HubSpot sync**: creates or updates the contact (matched by email), finds or creates the company, links them, and adds the contact to a chosen **campaign**. Sets an "Added by" property to `Cardimus - First Last`.
- **Nothing is lost**: every scan is stored in SQLite on the server the moment the AI answers. Failed syncs stay in the **Unsynced Contacts** panel with the error, and unsynced contacts can't be deleted.
- **English and Turkish UI** with an EN/TR switch in the header (defaults to the browser language). Add a language by extending `lib/i18n.ts`.
- **Several emails on a card**: all are kept and you pick the one to send to the CRM. Sync errors are shown as friendly messages; users only ever see the word "CRM".
- **Export** to the phone's contacts as a vCard (`.vcf`).
- **Accounts**: register/login with name, surname, email and password (scrypt-hashed). Sessions last 400 days and renew while in use.
- Installable as a PWA (needs HTTPS).

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · SQLite (Node's built-in `node:sqlite`) · Tom Select · Zod · `@anthropic-ai/sdk` · `@google/genai`

## Requirements

- **Node.js 24 or newer** (the database uses the built-in `node:sqlite`).
- An API key for at least one AI provider.
- A HubSpot private app token (to sync contacts).

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev
```

Open <http://localhost:3000>, register an account and scan a card.

To test on a phone on the same Wi-Fi, open `http://<your-computer-ip>:3000` and add that IP to `DEV_ORIGINS` in `.env.local`. Camera capture uses a normal file picker, so it works over plain HTTP. Installing as an app needs HTTPS.

## Configuration

Set these in `.env.local` (development) or in your host's environment settings (production). See `.env.example`.

| Variable | Purpose |
|---|---|
| `AI_PROVIDER` | `gemini` or `claude` (default `claude`) |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Gemini key from <https://aistudio.google.com/apikey> and model name |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Claude key from <https://platform.claude.com> and model name |
| `HUBSPOT_TOKEN` | HubSpot private app token |
| `HUBSPOT_ADDED_BY_PROPERTY` | Internal name of the "Added by" contact property (default `added_by`) |
| `DATABASE_PATH` | SQLite file location (default `data/cardimus.db`) |
| `COOKIE_SECURE` | Set `0` only to run production over plain HTTP |
| `DEV_ORIGINS` | Comma-separated LAN IPs allowed to load the dev server |

## HubSpot setup

1. **Private app scopes**: `crm.objects.contacts.read`, `crm.objects.contacts.write`, `crm.objects.companies.read`, `crm.objects.companies.write`, `marketing.campaigns.read`, `marketing.campaigns.write`.
2. **Contact property**: create a single-line text contact property labelled **Added by** with internal name `added_by` (or set `HUBSPOT_ADDED_BY_PROPERTY`). Syncing fails with a clear message if it is missing.
3. To see it in HubSpot, add the property to the contact sidebar card and/or the contact list columns.

## Production

`npm run package` builds a self-contained folder in `dist/` (Next.js standalone output) that can be uploaded to a server:

1. Upload everything in `dist/`, including the hidden `.next` folder.
2. Set the environment variables above on the host.
3. Run `node server.js` (`PORT` and `HOSTNAME` are respected) behind **HTTPS**.

`dist/DEPLOY.txt` repeats these steps. The host must be able to run a long-lived Node.js 24+ process; PHP-only shared hosting cannot run this app.

**The database** lives in `data/` (or `DATABASE_PATH`) and holds all users and contacts. Don't delete or overwrite it when deploying a new version, and back it up regularly. SQLite needs a persistent disk, so it won't work on serverless platforms with ephemeral storage.

## Project structure

```
app/
  (app)/            logged-in pages: scan, review/edit, history
  login, register   auth pages
  api/
    extract         image -> AI -> contact (saved to the database)
    cards           list/create/update/delete cards, and /sync to HubSpot
    campaigns       HubSpot campaign list
    auth            login, register, logout
components/         UI (Tom Select dropdowns, contact form, unsynced panel)
lib/
  i18n.ts, crm.ts, emails.ts         translations, friendly CRM errors, email parsing
  scan.ts                            photo -> AI -> stored card (also used for rescan)
  claude.ts, gemini.ts, extract.ts   AI providers and the shared prompt
  countries.ts                       country list + matching
  hubspot.ts                         HubSpot contact/company/campaign calls
  db.ts, auth.ts, cards.ts, guard.ts SQLite, sessions, cards, rate limiting
proxy.ts            redirects logged-out visitors to /login
scripts/package.sh  builds ./dist for upload
```

## Notes and limitations

- Rate limiting is in memory, so it applies per server process.
- A guessed phone dial code can be wrong (most likely on cards with no address and a generic `.com` site); the review screen warns when the AI had to guess.
- AI cost is a few cents per 100 cards on Flash/Haiku-class models; Gemini's thinking tokens count as output.
- Gemini's free tier can return 503 "high demand" errors; the server retries a few times.
