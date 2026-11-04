# Maison Ember — Full-Stack Restaurant Website

A premium fine-dining restaurant website built with React + Vite and an Express API.

## Features
- Responsive luxury restaurant homepage
- Interactive menu with category filtering, search, and vegetarian filter
- Reservation form with validation and availability lookup
- Express API for menu and reservations
- Reservations persisted to `server/data/reservations.json`
- Booking confirmation with reference number
- Demo restaurant details and sample menu data

> This is a demonstration project. It does not send emails, process payments, or connect to a real restaurant's booking system.

## Requirements
- Node.js 18+ (Node 20+ recommended)
- npm

## Run locally

Open two terminals.

### 1. Start the backend
```bash
cd server
npm install
npm run dev
```
API runs at `http://localhost:4000`.

### 2. Start the frontend
```bash
cd client
npm install
npm run dev
```
Open the URL Vite prints, usually `http://localhost:5173`.

The Vite dev server proxies `/api` requests to the backend.

## API endpoints
- `GET /api/health` — health check
- `GET /api/menu` — menu items
- `GET /api/availability?date=YYYY-MM-DD&guests=2` — available demo time slots
- `POST /api/reservations` — create a reservation
- `GET /api/reservations/:reference` — retrieve a reservation by reference

## Production notes
Before accepting real bookings:
- Use a database (PostgreSQL or MongoDB) instead of JSON-file storage.
- Add authentication/admin tools, rate limiting, spam protection, and secure validation.
- Configure real availability, timezone, email/SMS confirmation, privacy policy, and backups.
- Replace demo contact/location details and verify all menu/allergen information.
