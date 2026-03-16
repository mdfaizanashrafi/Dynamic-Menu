# DynamicMenu - AI Agent Guide

This document provides essential information for AI coding agents working on the DynamicMenu project. DynamicMenu is a production-grade SaaS platform for QR-based digital menu management for restaurants.

---

## Project Overview

DynamicMenu enables restaurants to create beautiful digital menus, generate QR codes for tables, track analytics, and manage their menu in real-time. The system consists of three main components:

- **Backend API**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **Frontend App**: React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Component Library**: Standalone UI component collection (`app/` directory)

---

## Repository Structure

```
Dynamic-Menu/
├── app/                          # Standalone UI component library
│   ├── src/components/ui/       # 40+ shadcn/ui components
│   ├── src/hooks/               # Custom React hooks
│   ├── src/lib/                 # Utility functions
│   ├── package.json             # Dependencies
│   ├── tailwind.config.js       # Tailwind configuration
│   └── vite.config.ts           # Vite configuration
│
├── dynamicmenu/                 # Main application
│   ├── backend/                 # Node.js API server
│   │   ├── src/
│   │   │   ├── modules/        # Feature modules (auth, menu, qr, etc.)
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── config/         # Database & env configuration
│   │   │   ├── utils/          # Error handling, logging, utilities
│   │   │   ├── types/          # Shared TypeScript types
│   │   │   ├── routes/         # Route aggregation
│   │   │   └── server.ts       # Main server entry point
│   │   ├── prisma/
│   │   │   └── schema.prisma   # Database schema definition
│   │   ├── package.json        # Backend dependencies
│   │   └── tsconfig.json       # TypeScript configuration
│   │
│   ├── frontend/               # React web application
│   │   ├── src/
│   │   │   ├── pages/          # Page components (Landing, Dashboard, etc.)
│   │   │   ├── components/ui/  # shadcn/ui components
│   │   │   ├── contexts/       # React contexts (AuthContext)
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── lib/            # Utility functions
│   │   │   └── App.tsx         # Main application with routing
│   │   ├── package.json        # Frontend dependencies
│   │   └── tailwind.config.js  # Tailwind CSS configuration
│   │
│   └── docs/                   # Project documentation
│       ├── architecture.md     # System architecture
│       ├── backend-development-guide.md
│       └── frontend-design-system.md
```

---

## Technology Stack

### Backend
- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 14+ with Prisma ORM 5.x
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod schemas
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Winston
- **Testing**: Vitest
- **Build**: tsc (TypeScript compiler)

### Frontend
- **Framework**: React 19
- **Language**: TypeScript 5.x
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui + Radix UI primitives
- **Icons**: Lucide React
- **Routing**: React Router DOM 6
- **Forms**: React Hook Form + Zod resolvers
- **Charts**: Recharts
- **Notifications**: Sonner

---

## Build and Development Commands

### Backend (from `dynamicmenu/backend/`)

```bash
# Install dependencies
npm install

# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations in development
npm run db:studio      # Open Prisma Studio

# Code quality
npm run lint           # ESLint
npm run typecheck      # TypeScript check without emit
npm test               # Run Vitest tests
```

### Frontend (from `dynamicmenu/frontend/` or `app/`)

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint
```

---

## Environment Configuration

### Backend Environment Variables (`dynamicmenu/backend/.env`)

```bash
# Required
DATABASE_URL="postgresql://user:password@localhost:5432/dynamicmenu?schema=public"
JWT_SECRET="your-super-secret-jwt-key-min-32-characters"
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173

# Optional
REDIS_URL=redis://localhost:6379
LOG_LEVEL=info
```

### Frontend Environment Variables

Create `.env` file in `dynamicmenu/frontend/`:

```bash
VITE_API_URL=http://localhost:3001/api
```

---

## Backend Architecture

### Module Structure

Each backend module follows a strict 4-layer architecture:

```
module/
├── module.types.ts      # Zod schemas & TypeScript types
├── module.repository.ts # Data access layer (Prisma queries)
├── module.service.ts    # Business logic layer
├── module.controller.ts # HTTP request handlers
└── module.routes.ts     # Route definitions
```

### Data Flow

```
Request → Route → Controller → Service → Repository → Database
                ↓         ↓          ↓
           Validate   Business    Query Builder
                      Logic
```

### Existing Modules

| Module | Purpose |
|--------|---------|
| `auth` | User registration, login, JWT authentication |
| `restaurant` | Restaurant CRUD operations |
| `menu` | Menu, categories, and menu items management |
| `qr` | QR code generation and tracking |
| `analytics` | Views, popular items, customer behavior |
| `public` | Public API for customer-facing menu |

### Path Aliases (tsconfig.json)

```typescript
import { prisma } from '@config/database';
import { authenticate } from '@middleware/auth';
import * as service from '@modules/menu/menu.service';
import { logger } from '@utils/logger';
```

---

## Code Style Guidelines

### Backend

#### Naming Conventions
- **Files**: kebab-case.ts (e.g., `user-service.ts`)
- **Functions**: camelCase (e.g., `getUserById`)
- **Types/Interfaces**: PascalCase (e.g., `UserResponse`)
- **Constants**: UPPER_SNAKE_CASE

#### Function Guidelines
- Single responsibility: Each function does exactly one thing
- Ideal size: 5-20 lines per function
- Maximum nesting: 3 levels
- Never suppress errors; use centralized error handling

#### Error Handling Pattern

```typescript
import { NotFoundError, ValidationError } from '@utils/errors';

// Good: Specific error types
const getUser = async (id: string) => {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundError('User', id);
  }
  return user;
};
```

### Frontend

#### Component Structure

```typescript
// Good: Clear structure, typed props
interface MenuItemProps {
  item: MenuItem;
  onToggle: (id: string) => void;
}

const MenuItemCard: React.FC<MenuItemProps> = ({ item, onToggle }) => {
  return <div className="...">{/* Content */}</div>;
};
```

#### Tailwind CSS Patterns

```tsx
// Container pattern
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

// Grid pattern
<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">

// Button variants
<Button className="bg-orange-500 hover:bg-orange-600 text-white">
<Button variant="outline" className="border-gray-300">
<Button variant="ghost" className="text-gray-600 hover:text-gray-900">
```

---

## Database Schema

### Core Entities

- **User**: Restaurant owners, managers, staff
- **Restaurant**: Restaurant profile with branding settings
- **Menu**: Time-based and seasonal menus
- **Category**: Menu categories with sort order
- **MenuItem**: Menu items with pricing, availability, tags
- **QRCode**: QR codes for tables/locations
- **Offer**: Promotional offers and discounts
- **Analytics**: View tracking and customer behavior

See `dynamicmenu/backend/prisma/schema.prisma` for complete schema definition.

### Running Migrations

```bash
cd dynamicmenu/backend

# Create new migration
npx prisma migrate dev --name add_new_feature

# Deploy to production
npx prisma migrate deploy

# Generate client after schema changes
npx prisma generate
```

---

## API Design

### Response Format

```typescript
// Success Response
{
  success: true,
  data: T,
  meta?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}

// Error Response
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: Record<string, unknown>
  }
}
```

### Authentication

- JWT-based authentication
- Token expires in 7 days (configurable via JWT_EXPIRES_IN)
- Role-based access control (OWNER, MANAGER, STAFF)

### Rate Limiting

- General: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Successful auth requests are skipped from rate limit

---

## Testing Instructions

### Backend Tests

Uses Vitest for unit testing. Test files should be named `*.test.ts` alongside the source files.

```typescript
import { describe, it, expect, vi } from 'vitest';

vi.mock('./module.repository');

describe('ModuleService', () => {
  it('should create a new item', async () => {
    const mockData = { name: 'Test' };
    vi.mocked(repository.create).mockResolvedValue({ id: '1', ...mockData });
    
    const result = await service.createItem(mockData);
    
    expect(result).toEqual({ id: '1', ...mockData });
  });
});
```

---

## Security Considerations

### Implemented Security Measures

1. **Helmet**: Security headers middleware
2. **CORS**: Configured for specific frontend origin
3. **Rate Limiting**: Prevents abuse and brute force
4. **Input Validation**: All inputs validated via Zod schemas
5. **Password Hashing**: bcrypt with 12 salt rounds
6. **SQL Injection Prevention**: Prisma ORM parameterized queries
7. **XSS Prevention**: Input sanitization

### Security Best Practices

- Never log sensitive data (passwords, tokens)
- JWT secret must be at least 32 characters in production
- Database credentials stored in environment variables only
- Use `select` in Prisma queries to limit exposed fields

---

## Documentation References

- `dynamicmenu/docs/architecture.md` - System architecture and design decisions
- `dynamicmenu/docs/backend-development-guide.md` - Backend development patterns
- `dynamicmenu/docs/frontend-design-system.md` - Frontend styling and components

---

## Quick Start for Development

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Setup Steps

```bash
# 1. Backend setup
cd dynamicmenu/backend
npm install
cp .env.example .env
# Edit .env with your database credentials

npx prisma migrate dev
npx prisma generate
npm run dev

# 2. Frontend setup (new terminal)
cd dynamicmenu/frontend
npm install
npm run dev

# 3. Access the application
# Frontend: http://localhost:5173
# API: http://localhost:3001
# API Health: http://localhost:3001/api/health
```

---

## Important Notes for AI Agents

1. **Two Frontend Directories**: The project has both `app/` and `dynamicmenu/frontend/`. The `app/` directory is a standalone UI component library, while `dynamicmenu/frontend/` is the actual application. Most changes should be made in `dynamicmenu/frontend/`.

2. **Module Consistency**: When adding backend features, maintain the 4-layer module structure (types → repository → service → controller → routes).

3. **Database Changes**: Always generate migrations and update the Prisma client after schema changes.

4. **Type Safety**: Both frontend and backend use strict TypeScript. Avoid `any` types.

5. **Error Handling**: Use the centralized error classes from `@utils/errors` in backend.

6. **API Consistency**: Maintain the standardized response format for all API endpoints.
