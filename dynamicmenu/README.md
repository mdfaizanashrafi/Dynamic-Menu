# DynamicMenu

A production-grade SaaS platform for QR-based digital menu management for restaurants.

## Features

- **Beautiful Digital Menus**: Create stunning, mobile-optimized menus
- **Instant Updates**: Update prices, items, and availability in real-time
- **QR Code Generation**: Unlimited QR codes for tables, rooms, and more
- **Multi-Language Support**: Support for multiple languages
- **Time-Based Menus**: Automatic switching between breakfast, lunch, and dinner
- **Analytics Dashboard**: Track views, popular items, and customer behavior
- **Easy Management**: Drag-and-drop menu builder

## Tech Stack

### Backend
- Node.js 18+ with TypeScript
- Express.js API framework
- PostgreSQL database with Prisma ORM
- JWT authentication
- Winston logging

### Frontend
- React 19 with TypeScript
- Vite build tool
- Tailwind CSS
- shadcn/ui components
- React Router DOM

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

```bash
cd backend
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

## Project Structure

```
dynamicmenu/
├── backend/              # Node.js API
│   ├── src/
│   │   ├── modules/     # Feature modules
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Utilities
│   └── prisma/          # Database schema
├── frontend/            # React app
│   └── src/
│       ├── pages/       # Page components
│       ├── components/  # Reusable components
│       └── contexts/    # React contexts
└── docs/                # Documentation
```

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Restaurants
- `GET /api/restaurants` - List restaurants
- `POST /api/restaurants` - Create restaurant
- `GET /api/restaurants/:id` - Get restaurant
- `PATCH /api/restaurants/:id` - Update restaurant
- `DELETE /api/restaurants/:id` - Delete restaurant

### Menu
- `GET /api/menu/restaurant/:id/menus` - List menus
- `POST /api/menu/restaurant/:id/menus` - Create menu
- `GET /api/menu/categories` - List categories
- `POST /api/menu/items` - Create menu item

### Public API
- `GET /api/public/menu/:slug` - Get public menu
- `GET /api/qr/scan/:code` - Process QR scan

## Environment Variables

### Backend
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dynamicmenu"
JWT_SECRET="your-secret-key-min-32-characters"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend
```env
VITE_API_URL=http://localhost:3001/api
```

## Documentation

- [Architecture](docs/architecture.md) - System architecture and design
- [Backend Guide](docs/backend-development-guide.md) - Backend development
- [Frontend Design](docs/frontend-design-system.md) - Frontend design system

## License

MIT License
