# DynamicMenu MVP

A lightweight, full-stack MVP for DynamicMenu. Restaurant owners can sign up, build a digital menu, and share a QR code that opens a mobile-friendly public menu.

## What's included

- **Backend** (`backend/`): Express + TypeScript + SQLite + JWT auth
- **Frontend** (`frontend/`): React + TypeScript + Vite + Tailwind CSS
- **Features**
  - Owner registration / login
  - Category and item CRUD
  - QR code generation
  - Public customer menu page at `/m/:slug`

## Quick start

### 1. Backend

```bash
cd mvp/backend
cp .env.example .env
npm install
npm run dev
```

API runs at `http://localhost:3001`.

### 2. Frontend

In a new terminal:

```bash
cd mvp/frontend
cp .env.example .env  # optional; dev proxy is preconfigured
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 3. Use the app

1. Open `http://localhost:5173/register`
2. Create an account and pick a URL slug
3. Add categories and menu items in the menu builder
4. View your public menu at `http://localhost:5173/m/your-slug`
5. Scan the QR code on the dashboard to open the public menu

## Production build

```bash
# Build frontend
cd mvp/frontend
npm run build

# Build backend
cd ../backend
npm run build

# Start production server
NODE_ENV=production npm start
```

The backend serves the built frontend from `mvp/frontend/dist`.

## API overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Current user |
| GET | `/api/menu` | Get full menu |
| POST | `/api/menu/categories` | Create category |
| PUT | `/api/menu/categories/:id` | Update category |
| DELETE | `/api/menu/categories/:id` | Delete category |
| POST | `/api/menu/items` | Create item |
| PUT | `/api/menu/items/:id` | Update item |
| DELETE | `/api/menu/items/:id` | Delete item |
| GET | `/api/public/menu/:slug` | Public menu JSON |
| GET | `/api/public/qr/:slug` | QR code data URL |
| GET | `/m/:slug` | Public menu HTML |
