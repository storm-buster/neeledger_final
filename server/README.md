NeeLedger Server
================

This is a minimal Express server used by the NeeLedger frontend for simple backend features such as geocoding proxy.

Quick start
-----------

1. cd server
2. npm install
3. npm start

The server listens on port 4000 by default and exposes:

- GET /api/geocode?q=search+term  -> proxies to OpenStreetMap Nominatim and returns JSON results

Note: This server is intentionally simple and meant for local development. For production, harden CORS, rate-limiting and add API key support where appropriate.
