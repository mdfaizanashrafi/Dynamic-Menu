# DynamicMenu Architecture

## Overview

DynamicMenu is a production-grade SaaS platform for QR-based digital menu management. This document describes the system architecture, design decisions, and technical implementation.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Marketing Site  │  Customer Menu  │  Owner Dashboard           │
│  (Landing Page)  │  (QR Scanner)   │  (Management UI)           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                               │
│                    (Express.js / Node.js)                         │
├─────────────────────────────────────────────────────────────────┤
│  Auth  │  Restaurant  │  Menu  │  QR  │ Analytics │  Offers      │
│ Module │   Module     │ Module │Module │  Module   │  Module      │
│        │              │        │       │           │ (Promotions) │
├────────┴──────────────┴────────┴───────┴───────────┴──────────────┤
│                        PUBLIC API MODULE                          │
│          (Customer-facing endpoints, no authentication)           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Prisma ORM  │  Redis (Cache/Sessions)           │
└─────────────────────────────────────────────────────────────────┘
```

## Repository Structure

```
dynamicmenu/
├── frontend/                 # React + TypeScript + Vite Frontend
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   │   └── ui/         # shadcn/ui components
│   │   ├── contexts/        # React contexts
│   │   └── hooks/           # Custom hooks
│   └── public/              # Static assets
│
├── backend/                  # Node.js + TypeScript API
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/        # Authentication
│   │   │   ├── restaurant/  # Restaurant management
│   │   │   ├── menu/        # Menu, categories, items
│   │   │   ├── qr/          # QR code generation
│   │   │   ├── analytics/   # Analytics tracking
│   │   │   ├── offer/       # Promotional offers & deals
│   │   │   └── public/      # Public API (customer-facing)
│   │   ├── config/          # Configuration
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Utility functions
│   │   └── types/           # TypeScript types
│   └── prisma/              # Database schema
│
└── docs/                     # Documentation
    ├── architecture.md
    ├── backend-development-guide.md
    ├── frontend-design-system.md
    ├── api-reference.md
    └── deployment-guide.md
```

## Backend Architecture

### Module Structure

Each module follows a strict 4-layer architecture:

```
module/
├── module.types.ts      # Type definitions & validation schemas
├── module.repository.ts # Data access layer (Prisma)
├── module.service.ts    # Business logic layer
├── module.controller.ts # HTTP request handlers
└── module.routes.ts     # Route definitions
```

### Data Flow

```
Request → Route → Controller → Service → Repository → Database
                ↓         ↓          ↓
           Validate   Business    Query
                      Logic       Builder
```

### Key Principles

1. **Single Responsibility**: Each function does exactly one thing
2. **Function Size**: Ideal size is 5-20 lines
3. **Maximum Nesting**: Max 3 levels of nesting
4. **Error Handling**: Never suppress errors, use centralized error handling
5. **No God Functions**: Break large logic into helpers

## Database Schema

### Core Entities

```
User
├── id, email, password, firstName, lastName
├── role (OWNER, MANAGER, STAFF)
└── restaurants[]

Restaurant
├── id, slug, name, description
├── branding (primaryColor, secondaryColor, logo)
├── settings (languages, publishing)
├── menus[], categories[], items[], qrCodes[]
├── offers[]
└── analytics[]

Menu
├── id, name, description, type
├── time-based visibility (startTime, endTime, daysOfWeek)
├── seasonal settings (startDate, endDate)
└── categories[]

Category
├── id, name, description, image
├── sortOrder
└── items[]

MenuItem
├── id, name, description, price, comparePrice
├── images, translations
├── flags (isAvailable, isFeatured, isPopular)
├── tags[]
└── analytics[]

QRCode
├── id, name, type, code
├── tableNumber, redirectUrl
├── downloadUrls (png, svg, pdf)
└── scanCount, lastScanAt

Offer (Deals & Promotions)
├── id, name, description
├── discountType (PERCENTAGE, FIXED_AMOUNT, FREE_ITEM)
├── discountValue
├── validity (startDate, endDate)
└── isActive
```

## Time-Based Menu Logic

The system supports intelligent time-based menu visibility, allowing restaurants to automatically display different menus based on time of day, day of week, and seasonal periods.

### Menu Time Configuration

```typescript
// Menu types for different time periods
enum MenuType {
  MAIN       // Default menu, always available
  BREAKFAST  // Morning menu (e.g., 6:00 - 11:00)
  LUNCH      // Lunch menu (e.g., 11:00 - 15:00)
  DINNER     // Dinner menu (e.g., 17:00 - 22:00)
  BRUNCH     // Weekend brunch
  SEASONAL   // Holiday specials, summer menu, etc.
  SPECIAL    // Event-specific menus
}
```

### Time-Based Visibility Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `startTime` | String (HH:MM) | Menu becomes active after this time | `"07:00"` |
| `endTime` | String (HH:MM) | Menu becomes inactive after this time | `"11:00"` |
| `daysOfWeek` | Int[] | Days when menu is available (1=Mon, 7=Sun) | `[1,2,3,4,5]` |
| `startDate` | Date | Seasonal menu start date | `2024-12-01` |
| `endDate` | Date | Seasonal menu end date | `2024-12-31` |

### Time-Based Query Logic

```
┌─────────────────────────────────────────────────────────────┐
│              TIME-BASED MENU RESOLUTION                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  INPUT: Current time, Restaurant ID                         │
│                      │                                      │
│                      ▼                                      │
│  ┌─────────────────────────────────────┐                   │
│  │ 1. Get all active menus for         │                   │
│  │    restaurant                       │                   │
│  └─────────────────────────────────────┘                   │
│                      │                                      │
│                      ▼                                      │
│  ┌─────────────────────────────────────┐                   │
│  │ 2. Filter by seasonal validity      │                   │
│  │    (if isSeasonal && current date   │                   │
│  │     within startDate/endDate)       │                   │
│  └─────────────────────────────────────┘                   │
│                      │                                      │
│                      ▼                                      │
│  ┌─────────────────────────────────────┐                   │
│  │ 3. Filter by time constraints       │                   │
│  │    - Check daysOfWeek includes      │                   │
│  │      current day                    │                   │
│  │    - Check current time between     │                   │
│  │      startTime and endTime          │                   │
│  └─────────────────────────────────────┘                   │
│                      │                                      │
│                      ▼                                      │
│  ┌─────────────────────────────────────┐                   │
│  │ 4. Sort by priority                 │                   │
│  │    - Time-specific menus first      │                   │
│  │    - Then by sortOrder              │                   │
│  └─────────────────────────────────────┘                   │
│                      │                                      │
│                      ▼                                      │
│  OUTPUT: Array of currently active menus                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Example Use Cases

```typescript
// Breakfast menu - Weekdays 7AM-11AM
{
  name: "Breakfast Menu",
  type: "BREAKFAST",
  startTime: "07:00",
  endTime: "11:00",
  daysOfWeek: [1, 2, 3, 4, 5],
  isActive: true
}

// Weekend Brunch - Sat-Sun 9AM-2PM
{
  name: "Weekend Brunch",
  type: "BRUNCH",
  startTime: "09:00",
  endTime: "14:00",
  daysOfWeek: [6, 7],
  isActive: true
}

// Holiday Special - December 2024
{
  name: "Holiday Specials",
  type: "SEASONAL",
  isSeasonal: true,
  startDate: "2024-12-01",
  endDate: "2024-12-31",
  isActive: true
}

// Dinner menu - Daily 5PM-10PM
{
  name: "Dinner Menu",
  type: "DINNER",
  startTime: "17:00",
  endTime: "22:00",
  daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
  isActive: true
}
```

### API Endpoint for Current Menus

```
GET /api/public/menu/:slug/current
```

Returns menus that are currently active based on the server's current time and the menu's time constraints.

## Offers & Promotions Module

The Offers module manages promotional deals, discounts, and special offers for restaurants.

### Offer Types

```typescript
enum DiscountType {
  PERCENTAGE      // e.g., 20% off
  FIXED_AMOUNT    // e.g., $10 off
  FREE_ITEM       // Buy X, get Y free
}
```

### Offer Lifecycle

```
┌─────────┐    Create     ┌──────────┐    Activate    ┌─────────┐
│  DRAFT  │ ─────────────▶ │ PENDING  │ ────────────▶ │ ACTIVE  │
└─────────┘                └──────────┘               └────┬────┘
                                                           │
                    ┌───────────────────────────────────────┘
                    │ Expire / Deactivate
                    ▼
              ┌──────────┐
              │ INACTIVE │
              └──────────┘
```

### Offer Routes

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/offers` | List all offers for restaurant | Yes |
| POST | `/api/offers` | Create new offer | Admin/Manager |
| GET | `/api/offers/:id` | Get offer details | Yes |
| PUT | `/api/offers/:id` | Update offer | Admin/Manager |
| DELETE | `/api/offers/:id` | Delete offer | Admin |
| POST | `/api/offers/:id/activate` | Activate offer | Admin/Manager |
| POST | `/api/offers/:id/deactivate` | Deactivate offer | Admin/Manager |
| GET | `/api/offers/public/:slug` | Get active offers (public) | No |

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

### Complete API Endpoints Reference

#### Public Routes (No Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/public/restaurant/:slug` | Get restaurant info |
| GET | `/api/public/menu/:slug` | Get full menu |
| GET | `/api/public/menu/:slug/current` | Get currently active menus |
| GET | `/api/public/menu/:slug/featured` | Get featured items |
| GET | `/api/public/menu/:slug/popular` | Get popular items |
| GET | `/api/public/qr/:code` | Process QR scan |

#### Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user |

#### Restaurant Management (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/restaurants` | List restaurants |
| POST | `/api/restaurants` | Create restaurant |
| POST | `/api/restaurants/generate-slug` | Generate unique slug |
| GET | `/api/restaurants/:id` | Get restaurant |
| GET | `/api/restaurants/by-slug/:slug` | Get by slug |
| GET | `/api/restaurants/:id/stats` | Get statistics |
| PATCH | `/api/restaurants/:id` | Update restaurant |
| DELETE | `/api/restaurants/:id` | Delete restaurant |

#### Menu Management (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu/restaurant/:id/menus` | List menus |
| POST | `/api/menu/restaurant/:id/menus` | Create menu |
| GET | `/api/menu/menus/:id` | Get menu |
| PATCH | `/api/menu/menus/:id` | Update menu |
| DELETE | `/api/menu/menus/:id` | Delete menu |
| GET | `/api/menu/restaurant/:id/categories` | List categories |
| POST | `/api/menu/restaurant/:id/categories` | Create category |
| POST | `/api/menu/restaurant/:id/categories/reorder` | Reorder categories |
| GET | `/api/menu/categories/:id` | Get category |
| PATCH | `/api/menu/categories/:id` | Update category |
| DELETE | `/api/menu/categories/:id` | Delete category |
| GET | `/api/menu/restaurant/:id/items` | List items |
| POST | `/api/menu/restaurant/:id/items` | Create item |
| POST | `/api/menu/categories/:id/items/reorder` | Reorder items |
| GET | `/api/menu/items/:id` | Get item |
| PATCH | `/api/menu/items/:id` | Update item |
| DELETE | `/api/menu/items/:id` | Delete item |
| PATCH | `/api/menu/items/:id/availability` | Toggle availability |

#### QR Code Management (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/qr/restaurant/:id` | List QR codes |
| POST | `/api/qr/restaurant/:id` | Create QR code |
| GET | `/api/qr/:id` | Get QR code |
| PATCH | `/api/qr/:id` | Update QR code |
| DELETE | `/api/qr/:id` | Delete QR code |
| GET | `/api/qr/scan/:code` | Process scan (public) |

#### Analytics (Authenticated)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/restaurant/:id` | Get analytics |
| POST | `/api/analytics/track` | Track event |

#### Offers/Deals (Authenticated)

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/offers` | List offers | Any |
| POST | `/api/offers` | Create offer | Admin/Manager |
| GET | `/api/offers/:id` | Get offer | Any |
| PUT | `/api/offers/:id` | Update offer | Admin/Manager |
| DELETE | `/api/offers/:id` | Delete offer | Admin |
| POST | `/api/offers/:id/activate` | Activate | Admin/Manager |
| POST | `/api/offers/:id/deactivate` | Deactivate | Admin/Manager |
| GET | `/api/offers/public/:slug` | Public offers | None |

## Authentication

- JWT-based authentication
- Token expires in 7 days (configurable via JWT_EXPIRES_IN)
- Refresh token mechanism (future)
- Role-based access control (OWNER, MANAGER, STAFF)

### Role Permissions

```
┌─────────────────┬─────────┬─────────┬───────┐
│     Action      │  OWNER  │ MANAGER │ STAFF │
├─────────────────┼─────────┼─────────┼───────┤
│ View menus      │    ✓    │    ✓    │   ✓   │
│ Edit menus      │    ✓    │    ✓    │   ✓   │
│ Create offers   │    ✓    │    ✓    │   ✗   │
│ Delete offers   │    ✓    │    ✗    │   ✗   │
│ Manage QR codes │    ✓    │    ✓    │   ✗   │
│ View analytics  │    ✓    │    ✓    │   ✓   │
│ Manage staff    │    ✓    │    ✗    │   ✗   │
│ Delete restaurant│   ✓    │    ✗    │   ✗   │
└─────────────────┴─────────┴─────────┴───────┘
```

## Rate Limiting

- General: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Skip successful auth requests

## Security

### Implemented Measures

1. **Helmet**: Security headers
2. **CORS**: Configured for frontend origin
3. **Rate Limiting**: Prevent abuse
4. **Input Validation**: Zod schemas
5. **Password Hashing**: bcrypt with salt rounds 12
6. **SQL Injection Prevention**: Prisma ORM
7. **XSS Prevention**: Input sanitization

### Environment Variables

```bash
# Required
DATABASE_URL="postgresql://..."
JWT_SECRET="min-32-characters"
PORT=3001
NODE_ENV=production

# Optional
REDIS_URL="redis://..."
AWS_S3_BUCKET="..."
```

## Performance

### Optimizations

1. **Database**: Connection pooling via Prisma
2. **Query Optimization**: Select specific fields
3. **Pagination**: All list endpoints paginated
4. **Caching**: Redis for sessions (future)
5. **Compression**: Gzip for responses

### Monitoring

- Structured logging with Winston
- Error tracking
- Performance metrics (future)

## Scalability

### Horizontal Scaling

- Stateless API design
- Database read replicas (future)
- CDN for static assets (future)

### Vertical Scaling

- Efficient queries (no N+1)
- Proper indexing
- Query optimization

## Deployment

### Requirements

- Node.js 18+
- PostgreSQL 14+
- Redis 6+ (optional)

### Process

1. Install dependencies: `npm install`
2. Run migrations: `npx prisma migrate deploy`
3. Generate client: `npx prisma generate`
4. Build: `npm run build`
5. Start: `npm start`

See [deployment-guide.md](./deployment-guide.md) for detailed deployment instructions.

## Future Enhancements

1. **Ordering System**: Customer ordering with payment
2. **Kitchen Display**: Real-time order management
3. **POS Integration**: Connect with existing POS systems
4. **Loyalty Program**: Customer rewards
5. **Multi-tenant**: Advanced tenant isolation
6. **White-label**: Custom branding options
7. **Advanced Analytics**: ML-based insights
8. **Mobile Apps**: Native iOS/Android apps
