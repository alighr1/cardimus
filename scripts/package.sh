#!/bin/sh
# Builds the app and assembles ./dist, the folder you upload to the server.
set -e
cd "$(dirname "$0")/.."
npm run build
rm -rf dist
mkdir dist
cp -R .next/standalone/. dist/
mkdir -p dist/.next
cp -R .next/static dist/.next/static
[ -d public ] && cp -R public dist/public
rm -rf dist/data dist/.env.local dist/.env
# Image-optimizer binaries are platform-specific and unused (the app has no next/image).
rm -rf dist/node_modules/@img dist/node_modules/sharp
cp .env.example dist/.env.example
cat > dist/DEPLOY.txt <<'TXT'
Cardimus - deploy steps
1. Needs Node.js 24 or newer on the server (uses the built-in node:sqlite).
2. Upload everything in this folder (including the hidden .next folder).
3. Set the environment variables from .env.example in your host's panel
   (ANTHROPIC_API_KEY or GEMINI_API_KEY + AI_PROVIDER, HUBSPOT_TOKEN, ...).
4. Start with:  node server.js     (PORT and HOSTNAME env vars are respected)
5. Serve it over HTTPS. Logins need it.
6. The database is created in ./data (or DATABASE_PATH). NEVER delete or overwrite that folder
   when uploading a new version; it holds all users and contacts. Back it up regularly.
TXT
echo "Packaged to ./dist"
