# QR Code Manager

Offline QR code generator and management dashboard built with Express + SQLite and a lightweight vanilla JS frontend. The app creates QR codes locally (no external APIs), stores metadata, and supports activation/deactivation with redirect links.

## Features
- Generate QR codes for any text/URL with PNG (256/512/1024) and SVG downloads.
- Dashboard with stats, filters, search, and inline actions.
- Detail panel with preview, editing, status toggle, and redirect preview (`/r/:id`).
- Activation/deactivation logic that redirects when active or shows a disabled page when inactive.
- SQLite persistence and optional scan logging.

## Getting Started
1. Install dependencies (Node.js 18+ recommended):
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open http://localhost:3000 to use the dashboard.

## API Endpoints
- `GET /api/qrs?status=active|inactive` — list QR codes.
- `GET /api/qrs/:id` — fetch a single QR.
- `POST /api/qrs` — create `{ name, data, status? }`.
- `PUT /api/qrs/:id` — update name/data/status.
- `POST /api/qrs/:id/activate` and `/deactivate` — toggle status.
- `GET /api/stats` — totals for cards.
- `GET /r/:id` — redirect handler (logs scans and blocks inactive codes).

## Project Structure
- `server.js` — Express app, routes, redirect handler.
- `db.js` — SQLite initialization and helpers.
- `public/` — static frontend (HTML, CSS, JS, and embedded QR generator library).

## Notes
- QR generation uses the bundled `public/lib/qrcode.min.js` (offline library).
- Downloads use `canvas.toDataURL` for PNG and SVG serialization for vector output.
