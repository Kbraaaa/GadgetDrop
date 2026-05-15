# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GadgetDrop is a full-stack e-commerce application for gadgets. The repo contains:
- **`src/`** — Express.js backend (Node.js)
- **`frontend-gadgetdrop/`** — React frontend (Vite + Tailwind CSS)

## Commands

### Backend
```bash
npm run dev       # Start with Nodemon (watches src/)
npm start         # Production start
npm test          # Run Jest tests with coverage
npm run seed      # Seed the database
```

### Frontend
```bash
cd frontend-gadgetdrop
npm run dev       # Vite dev server → http://localhost:5173
npm run build     # Production build → dist/
npm run lint      # ESLint
```

### Running a single test
```bash
npm test -- --testPathPattern=auth    # e.g., run only auth.test.js
```

**Key ports:** Backend `5000`, Frontend `5173`

## Architecture

### Stack
- **Backend:** Express 5, Sequelize ORM, PostgreSQL, JWT auth, bcryptjs, Stripe, Nodemailer
- **Frontend:** React 19, React Router 7, Vite, Tailwind CSS 4, Lucide React
- **Tests:** Jest + Supertest (integration tests in `src/tests/`)

### Request Flow
Frontend calls `http://localhost:5000/api/*` (hardcoded base URL in each component). Auth tokens are stored in `localStorage` under the key `usuario` and sent as `Authorization: Bearer <token>` headers. The `authMiddleware.js` verifies the JWT; `verificarAdmin.js` further checks `req.usuario.rol === 'admin'`.

### Key models (`src/models/`)
| Model | Purpose |
|---|---|
| `Usuario` | Users — includes `failedLoginAttempts` / `lockUntil` for lockout logic |
| `Producto` | Product catalog |
| `Carrito` | Per-user shopping cart items |
| `Pedido` | Orders; `externalId` holds the Stripe session ID |
| `DetallePedido` | Line items within an order |
| `LockHistory` | Audit trail for failed login attempts |
| `SupportMessage` | Customer support tickets |

Relationships are declared in `src/models/index.js`. Sequelize runs `sync({ alter: true })` in dev/test, and no sync in production.

### Payment flow (Stripe)
1. Frontend POSTs cart + userId to `POST /api/pago/stripe`.
2. Backend creates a Stripe Checkout session and returns the URL.
3. User completes payment on Stripe; success redirects to `/success?session_id=...`.
4. Stripe calls `POST /api/pedidos/pagado` (webhook/redirect) which creates the `Pedido` + `DetallePedido` records from Stripe session metadata.

### Admin panel
The `/admin` route (frontend) and `/api/admin` routes (backend) are gated by the `verificarAdmin` middleware. Admin users manage products, update order statuses, and view support messages.

### Toast notifications
A custom `ToastContext` is provided in `frontend-gadgetdrop/src/main.jsx`. Use the `useToast()` hook inside any component — do not create ad-hoc alert/toast solutions.

## Known Issues & Important Notes

- **Hardcoded API base URL** — all frontend components call `http://localhost:5000/api` directly; no env-var abstraction exists yet.
- **Hardcoded Stripe redirect URLs** — payment controller redirects to `localhost:5173`; must be changed for production.
- **DB credentials** — `src/config/db.js` may contain hardcoded credentials; use `.env` variables instead.
- **Duplicate routes** in `src/routes/productoRoutes.js` — lines 13-23 register the same endpoints twice; be careful when editing that file.
- Auth endpoints accept both English (`email`/`password`) and Spanish (`correo`/`contraseña`) field names for test compatibility.
