# API Reference

Complete reference for the DynamicMenu REST API. All endpoints are prefixed with `/api` unless otherwise specified.

## Tenant Context Architecture

DynamicMenu is a multi-tenant platform where each restaurant operates as an isolated tenant. All API requests automatically resolve a tenant context based on the request path and authentication.

### How Tenant Resolution Works

Every request is analyzed by the Tenant Resolver Middleware to determine the target restaurant:

| Endpoint Pattern | Resolution Strategy | Example |
|-----------------|---------------------|---------|
| `/api/public/menu/:slug` | Slug-based | Extract restaurant from URL slug |
| `/api/menu/restaurant/:restaurantId` | Owner-based | Verify user owns restaurantId |
| `/api/public/qr/:code` | QR-based | Lookup restaurant from QR code |

### Tenant Context in Requests

Once resolved, the tenant context is available throughout the request lifecycle:

```typescript
req.tenant = {
  restaurantId: "uuid",
  slug?: "restaurant-slug",
  tableNumber?: 5,
  qrType?: "TABLE",
  isPublic: true,
  resolvedAt: Date
}
```

### Tenant Isolation Guarantees

All database queries automatically include tenant filtering:
- Users can only access data belonging to their restaurant
- Cross-tenant data access is prevented at the repository layer
- Public endpoints only expose published restaurant data

---

## Idempotency Protection

All write operations (POST, PUT, PATCH) support idempotency to prevent duplicate operations caused by network retries, timeouts, or double-clicks.

### Using Idempotency Keys

Include the `Idempotency-Key` header in write requests:

```http
POST /api/menu/restaurant/:restaurantId/items
Idempotency-Key: 8d3f4e2a-9f4b-4c7e-a123-5c9d1b2e3f4a
Content-Type: application/json

{
  "name": "Margherita Pizza",
  "price": 14.99
}
```

### Idempotency Behavior

**First Request:**
- Server processes the request normally
- Response is stored associated with the idempotency key
- Returns success response

**Duplicate Request (same key, same body):**
- Server detects duplicate
- Returns stored response with replay indicator:

```json
{
  "success": true,
  "data": { "id": "item-123", "name": "Margherita Pizza" },
  "meta": {
    "idempotencyReplay": true,
    "originalTimestamp": "2024-01-01T00:00:00Z"
  }
}
```

**Conflicting Request (same key, different body):**
- Returns 409 CONFLICT error

```json
{
  "success": false,
  "error": {
    "code": "IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST",
    "message": "Idempotency key was used with a different request body"
  }
}
```

### Supported Endpoints

Idempotency is supported on all POST, PUT, and PATCH endpoints:

| Endpoint | Method | Supports Idempotency |
|----------|--------|---------------------|
| `/api/restaurants` | POST | ✅ |
| `/api/menu/restaurant/:id/items` | POST | ✅ |
| `/api/menu/restaurant/:id/categories` | POST | ✅ |
| `/api/qr/restaurant/:id` | POST | ✅ |
| `/api/offers` | POST | ✅ |
| `/api/auth/register` | POST | ✅ |

### Key Requirements
- Key must be unique per request (UUID recommended)
- Key is valid for 24 hours
- Only successful responses (2xx) are stored
- Failed requests can be retried with the same key

---

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:3001/api` |
| Production | `https://api.yourdomain.com/api` |

## Authentication

The API uses JWT (JSON Web Token) authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

Obtain a token through the `/auth/login` or `/auth/register` endpoints.

### Token Expiration

- Default expiration: 7 days
- Configure via `JWT_EXPIRES_IN` environment variable

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... },
    "retryAfter": 60
  }
}
```

### Idempotency Replay Indicator

When a request is replayed using an idempotency key, the response includes metadata:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "idempotencyReplay": true,
    "originalTimestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Standard Request Headers

### Idempotency-Key
Prevents duplicate write operations.

```
Idempotency-Key: <uuid>
```

### Authorization
Bearer token for authenticated endpoints.

```
Authorization: Bearer <jwt-token>
```

### X-Restaurant-ID
Optional header to specify target restaurant (alternative to path parameter).

```
X-Restaurant-ID: <restaurant-uuid>
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate or conflicting data |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Database or service down |

---

## Error Codes Reference

### Authentication Errors

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing token |
| `TOKEN_EXPIRED` | 401 | Token has expired |
| `FORBIDDEN` | 403 | Insufficient permissions |

### Resource Errors

| Code | Status | Description |
|------|--------|-------------|
| `USER_NOT_FOUND` | 404 | User not found |
| `RESTAURANT_NOT_FOUND` | 404 | Restaurant not found |
| `MENU_NOT_FOUND` | 404 | Menu not found |
| `CATEGORY_NOT_FOUND` | 404 | Category not found |
| `ITEM_NOT_FOUND` | 404 | Menu item not found |
| `QR_NOT_FOUND` | 404 | QR code not found |
| `OFFER_NOT_FOUND` | 404 | Offer not found |

### Validation Errors

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `DUPLICATE_ENTRY` | 409 | Unique constraint violation |
| `CONSTRAINT_VIOLATION` | 409 | Foreign key constraint failed |
| `NULL_CONSTRAINT_VIOLATION` | 400 | Required field is null |

### Rate Limiting

| Code | Status | Description |
|------|--------|-------------|
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

### Server Errors

| Code | Status | Description |
|------|--------|-------------|
| `DATABASE_ERROR` | 503 | Database operation failed |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Idempotency Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_REQUEST` | 409 | Same key used with different request body |
| `IDEMPOTENCY_KEY_INVALID` | 400 | Key format is invalid (max 64 chars) |

### Tenant/Ownership Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `FORBIDDEN` | 403 | User does not have access to this restaurant |
| `RESTAURANT_NOT_FOUND` | 404 | Restaurant not found or doesn't exist |

---

## Public Endpoints

No authentication required.

### Health Check

```http
GET /api/health
```

Check API availability.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "version": "1.0.0",
    "environment": "production"
  }
}
```

---

### Get Restaurant Info

```http
GET /api/public/restaurant/:slug
```

Get public information about a restaurant.

**Parameters:**

| Name | Type | In | Description |
|------|------|-----|-------------|
| slug | string | path | Restaurant unique slug |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Bistro Central",
    "slug": "bistro-central",
    "description": "Fine dining experience",
    "logo": "https://cdn.example.com/logo.jpg",
    "address": "123 Main St",
    "phone": "+1234567890",
    "email": "contact@bistro.com",
    "website": "https://bistro.com",
    "primaryColor": "#FF6B35",
    "secondaryColor": "#16A34A",
    "defaultLanguage": "en",
    "supportedLanguages": ["en", "es", "fr"]
  }
}
```

---

### Get Full Menu

```http
GET /api/public/menu/:slug
```

Get the complete menu for a restaurant.

**Parameters:**

| Name | Type | In | Description |
|------|------|-----|-------------|
| slug | string | path | Restaurant unique slug |

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "uuid",
      "name": "Bistro Central",
      "slug": "bistro-central",
      "description": "Fine dining experience",
      "logo": "https://cdn.example.com/logo.jpg",
      "primaryColor": "#FF6B35",
      "secondaryColor": "#16A34A",
      "defaultLanguage": "en",
      "supportedLanguages": ["en", "es"]
    },
    "categories": [
      {
        "id": "uuid",
        "name": "Appetizers",
        "description": "Start your meal right",
        "image": "https://cdn.example.com/appetizers.jpg",
        "sortOrder": 1,
        "items": [
          {
            "id": "uuid",
            "name": "Caesar Salad",
            "description": "Fresh romaine with Caesar dressing",
            "price": 12.99,
            "comparePrice": 15.99,
            "image": "https://cdn.example.com/salad.jpg",
            "images": [],
            "isAvailable": true,
            "isFeatured": false,
            "isPopular": true,
            "sortOrder": 1,
            "tags": [
              {
                "id": "uuid",
                "name": "VEGETARIAN",
                "color": "#16A34A",
                "textColor": "#FFFFFF"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

### Get Currently Active Menus

```http
GET /api/public/menu/:slug/current
```

Get menus that are currently active based on time constraints (breakfast, lunch, dinner, etc.).

**Parameters:**

| Name | Type | In | Description |
|------|------|-----|-------------|
| slug | string | path | Restaurant unique slug |

**Response:**
```json
{
  "success": true,
  "data": {
    "restaurant": {
      "id": "uuid",
      "name": "Bistro Central",
      "slug": "bistro-central",
      "primaryColor": "#FF6B35",
      "secondaryColor": "#16A34A",
      "defaultLanguage": "en",
      "supportedLanguages": ["en"]
    },
    "menus": [
      {
        "id": "uuid",
        "name": "Lunch Menu",
        "description": "Available 11AM - 3PM",
        "type": "LUNCH",
        "isSeasonal": false,
        "startTime": "11:00",
        "endTime": "15:00",
        "daysOfWeek": [1, 2, 3, 4, 5],
        "sortOrder": 1
      }
    ],
    "currentTime": "2024-01-15T12:30:00.000Z"
  }
}
```

---

### Get Featured Items

```http
GET /api/public/menu/:slug/featured
```

Get featured menu items for a restaurant.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Chef's Special Pasta",
      "description": "House-made pasta with truffle",
      "price": 24.99,
      "image": "https://cdn.example.com/pasta.jpg",
      "category": {
        "id": "uuid",
        "name": "Main Courses"
      }
    }
  ]
}
```

---

### Get Popular Items

```http
GET /api/public/menu/:slug/popular
```

Get popular menu items for a restaurant.

**Response:** Same format as featured items.

---

### Process QR Code Scan

```http
GET /api/public/qr/:code
```

Process a QR code scan and return redirect information.

**Parameters:**

| Name | Type | In | Description |
|------|------|-----|-------------|
| code | string | path | QR code string |

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "restaurantSlug": "bistro-central",
    "restaurantName": "Bistro Central",
    "qrType": "TABLE",
    "tableNumber": 5
  }
}
```

**Response (QR Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "QR_NOT_FOUND",
    "message": "Invalid QR code"
  }
}
```

---

## Authentication Endpoints

### Register

```http
POST /api/auth/register
```

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation Rules:**
- `email`: Valid email format, max 255 characters
- `password`: Minimum 8 characters, must contain at least one number
- `firstName`: 1-100 characters
- `lastName`: 1-100 characters

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "OWNER",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**
- `409 CONFLICT` - Email already exists
- `400 VALIDATION_ERROR` - Invalid input data

---

### Login

```http
POST /api/auth/login
```

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "OWNER"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Responses:**
- `401 UNAUTHORIZED` - Invalid credentials
- `429 RATE_LIMIT_EXCEEDED` - Too many login attempts

---

### Get Current User

```http
GET /api/auth/me
Authorization: Bearer <token>
```

Get information about the currently authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "OWNER",
    "restaurants": [
      {
        "id": "uuid",
        "name": "Bistro Central",
        "slug": "bistro-central"
      }
    ]
  }
}
```

---

## Restaurant Endpoints

All restaurant endpoints require authentication.

### List Restaurants

```http
GET /api/restaurants?page=1&limit=20
Authorization: Bearer <token>
```

Get all restaurants for the authenticated user.

**Query Parameters:**

| Name | Type | Default | Description |
|------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "slug": "bistro-central",
      "name": "Bistro Central",
      "description": "Fine dining experience",
      "logo": "https://cdn.example.com/logo.jpg",
      "isActive": true,
      "isPublished": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### Create Restaurant

```http
POST /api/restaurants
Authorization: Bearer <token>
```

Create a new restaurant.

**Request Body:**
```json
{
  "name": "My Restaurant",
  "slug": "my-restaurant",
  "description": "A great place to eat",
  "address": "123 Main St",
  "phone": "+1234567890",
  "email": "contact@restaurant.com",
  "website": "https://restaurant.com",
  "primaryColor": "#FF6B35",
  "secondaryColor": "#16A34A"
}
```

**Validation Rules:**
- `name`: 1-100 characters, required
- `slug`: 2-100 characters, unique, URL-friendly (lowercase, hyphens)
- `description`: Max 1000 characters
- `primaryColor`, `secondaryColor`: Valid hex color codes

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "my-restaurant",
    "name": "My Restaurant",
    "description": "A great place to eat",
    "logo": null,
    "address": "123 Main St",
    "phone": "+1234567890",
    "email": "contact@restaurant.com",
    "website": "https://restaurant.com",
    "primaryColor": "#FF6B35",
    "secondaryColor": "#16A34A",
    "fontFamily": "Inter",
    "isActive": true,
    "isPublished": false,
    "defaultLanguage": "en",
    "supportedLanguages": ["en"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Get Restaurant

```http
GET /api/restaurants/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "slug": "my-restaurant",
    "name": "My Restaurant",
    "description": "A great place to eat",
    "logo": "https://cdn.example.com/logo.jpg",
    "address": "123 Main St",
    "phone": "+1234567890",
    "email": "contact@restaurant.com",
    "website": "https://restaurant.com",
    "primaryColor": "#FF6B35",
    "secondaryColor": "#16A34A",
    "fontFamily": "Inter",
    "isActive": true,
    "isPublished": true,
    "defaultLanguage": "en",
    "supportedLanguages": ["en", "es"],
    "menuCount": 5,
    "categoryCount": 12,
    "itemCount": 48,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### Get Restaurant by Slug

```http
GET /api/restaurants/by-slug/:slug
Authorization: Bearer <token>
```

---

### Update Restaurant

```http
PATCH /api/restaurants/:id
Authorization: Bearer <token>
```

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Restaurant Name",
  "description": "Updated description",
  "isPublished": true,
  "primaryColor": "#E55A2B"
}
```

---

### Delete Restaurant

```http
DELETE /api/restaurants/:id
Authorization: Bearer <token>
```

**Response (204):** No content

---

### Generate Slug

```http
POST /api/restaurants/generate-slug
Authorization: Bearer <token>
```

Generate a unique slug from a restaurant name.

**Request Body:**
```json
{
  "name": "My Restaurant Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "slug": "my-restaurant-name",
    "available": true
  }
}
```

---

## Menu Management Endpoints

### Menus

#### List Menus

```http
GET /api/menu/restaurant/:restaurantId/menus
Authorization: Bearer <token>
```

#### Create Menu

```http
POST /api/menu/restaurant/:restaurantId/menus
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Lunch Menu",
  "description": "Available 11AM - 3PM weekdays",
  "type": "LUNCH",
  "startTime": "11:00",
  "endTime": "15:00",
  "daysOfWeek": [1, 2, 3, 4, 5],
  "sortOrder": 1
}
```

**Menu Types:** `MAIN`, `BREAKFAST`, `LUNCH`, `DINNER`, `BRUNCH`, `SEASONAL`, `SPECIAL`

**Time-Based Fields:**
- `startTime`: `HH:MM` format (e.g., "11:00")
- `endTime`: `HH:MM` format (e.g., "15:00")
- `daysOfWeek`: Array of integers (1=Monday, 7=Sunday)
- `startDate`, `endDate`: ISO date strings for seasonal menus

---

#### Get Menu

```http
GET /api/menu/menus/:id
Authorization: Bearer <token>
```

---

#### Update Menu

```http
PATCH /api/menu/menus/:id
Authorization: Bearer <token>
```

---

#### Delete Menu

```http
DELETE /api/menu/menus/:id
Authorization: Bearer <token>
```

---

### Categories

#### List Categories

```http
GET /api/menu/restaurant/:restaurantId/categories
Authorization: Bearer <token>
```

---

#### Create Category

```http
POST /api/menu/restaurant/:restaurantId/categories
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Appetizers",
  "description": "Start your meal right",
  "image": "https://cdn.example.com/appetizers.jpg",
  "menuId": "uuid",
  "sortOrder": 1
}
```

---

#### Reorder Categories

```http
POST /api/menu/restaurant/:restaurantId/categories/reorder
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "categoryIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

---

#### Get Category

```http
GET /api/menu/categories/:id
Authorization: Bearer <token>
```

---

#### Update Category

```http
PATCH /api/menu/categories/:id
Authorization: Bearer <token>
```

---

#### Delete Category

```http
DELETE /api/menu/categories/:id
Authorization: Bearer <token>
```

---

### Menu Items

#### List Items

```http
GET /api/menu/restaurant/:restaurantId/items
Authorization: Bearer <token>
```

**Query Parameters:**

| Name | Type | Description |
|------|------|-------------|
| categoryId | string | Filter by category |
| isAvailable | boolean | Filter by availability |
| isFeatured | boolean | Filter featured items |
| isPopular | boolean | Filter popular items |

---

#### Create Item

```http
POST /api/menu/restaurant/:restaurantId/items
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Caesar Salad",
  "description": "Fresh romaine lettuce with Caesar dressing, croutons, and parmesan",
  "price": 12.99,
  "comparePrice": 15.99,
  "image": "https://cdn.example.com/salad.jpg",
  "images": ["https://cdn.example.com/salad-1.jpg", "https://cdn.example.com/salad-2.jpg"],
  "categoryId": "uuid",
  "isAvailable": true,
  "isFeatured": false,
  "isPopular": true,
  "sortOrder": 1,
  "tagIds": ["uuid-1", "uuid-2"],
  "translations": {
    "es": {
      "name": "Ensalada César",
      "description": "Lechuga romana fresca con aderezo César"
    }
  }
}
```

---

#### Reorder Items

```http
POST /api/menu/categories/:categoryId/items/reorder
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "itemIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

---

#### Get Item

```http
GET /api/menu/items/:id
Authorization: Bearer <token>
```

---

#### Update Item

```http
PATCH /api/menu/items/:id
Authorization: Bearer <token>
```

---

#### Delete Item

```http
DELETE /api/menu/items/:id
Authorization: Bearer <token>
```

---

#### Toggle Availability

```http
PATCH /api/menu/items/:id/availability
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "isAvailable": false
}
```

---

## QR Code Endpoints

### List QR Codes

```http
GET /api/qr/restaurant/:restaurantId
Authorization: Bearer <token>
```

---

### Create QR Code

```http
POST /api/qr/restaurant/:restaurantId
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Table 1",
  "type": "TABLE",
  "tableNumber": 1,
  "redirectUrl": null
}
```

**QR Types:** `RESTAURANT`, `TABLE`, `ROOM`, `BAR`, `TAKEAWAY`, `DELIVERY`

---

### Get QR Code

```http
GET /api/qr/:id
Authorization: Bearer <token>
```

---

### Update QR Code

```http
PATCH /api/qr/:id
Authorization: Bearer <token>
```

---

### Delete QR Code

```http
DELETE /api/qr/:id
Authorization: Bearer <token>
```

---

## Analytics Endpoints

### Get Analytics

```http
GET /api/analytics/restaurant/:restaurantId?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

**Query Parameters:**

| Name | Type | Description |
|------|------|-------------|
| startDate | string | Start date (ISO format) |
| endDate | string | End date (ISO format) |

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalViews": 1234,
      "uniqueVisitors": 567,
      "avgSessionTime": 120
    },
    "daily": [
      {
        "date": "2024-01-15",
        "views": 45,
        "visitors": 23,
        "avgSessionTime": 110
      }
    ],
    "deviceTypes": {
      "mobile": 65,
      "desktop": 30,
      "tablet": 5
    },
    "popularItems": [
      {
        "id": "uuid",
        "name": "Caesar Salad",
        "views": 89
      }
    ]
  }
}
```

---

### Track Event

```http
POST /api/analytics/track
```

**Request Body:**
```json
{
  "restaurantId": "uuid",
  "eventType": "MENU_VIEW",
  "metadata": {
    "path": "/menu/bistro-central",
    "deviceType": "mobile"
  }
}
```

---

## Offers/Deals Endpoints

### List Offers

```http
GET /api/offers?page=1&limit=20&activeOnly=true
Authorization: Bearer <token>
```

**Query Parameters:**

| Name | Type | Description |
|------|------|-------------|
| activeOnly | boolean | Filter active offers only |
| includeInactive | boolean | Include inactive offers |

---

### Create Offer

```http
POST /api/offers
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Weekend Special",
  "description": "20% off all items on weekends",
  "discountType": "PERCENTAGE",
  "discountValue": 20,
  "startDate": "2024-01-20T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "isActive": true
}
```

**Discount Types:**
- `PERCENTAGE`: Percentage off (e.g., 20%)
- `FIXED_AMOUNT`: Fixed amount off (e.g., $10)
- `FREE_ITEM`: Buy one get one free

---

### Get Offer

```http
GET /api/offers/:id
Authorization: Bearer <token>
```

---

### Update Offer

```http
PUT /api/offers/:id
Authorization: Bearer <token>
```

---

### Delete Offer

```http
DELETE /api/offers/:id
Authorization: Bearer <token>
```

**Note:** Only users with `OWNER` role can delete offers.

---

### Activate Offer

```http
POST /api/offers/:id/activate
Authorization: Bearer <token>
```

---

### Deactivate Offer

```http
POST /api/offers/:id/deactivate
Authorization: Bearer <token>
```

---

### Get Public Offers

```http
GET /api/offers/public/:restaurantSlug
```

Get active offers for a restaurant (public endpoint).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Weekend Special",
      "description": "20% off all items on weekends",
      "discountType": "PERCENTAGE",
      "discountValue": 20,
      "endDate": "2024-12-31T23:59:59Z"
    }
  ]
}
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| General | 100 requests | 15 minutes |
| Authentication | 5 requests | 15 minutes |
| Public endpoints | 200 requests | 15 minutes |

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642252800
```

---

## Pagination

List endpoints support pagination via query parameters:

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| page | integer | 1 | - | Page number (1-indexed) |
| limit | integer | 20 | 100 | Items per page |

**Example:**
```http
GET /api/menu/restaurant/:id/items?page=2&limit=50
```

---

## Filtering & Sorting

Common query parameters for filtering:

| Parameter | Type | Description |
|-----------|------|-------------|
| search | string | Search term for text fields |
| sortBy | string | Field to sort by |
| sortOrder | string | `asc` or `desc` |
| isActive | boolean | Filter by active status |

**Example:**
```http
GET /api/menu/restaurant/:id/items?search=salad&isActive=true&sortBy=price&sortOrder=desc
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
// API Client Setup
const API_BASE = 'https://api.yourdomain.com/api';

class DynamicMenuAPI {
  private token: string;
  
  constructor(token: string) {
    this.token = token;
  }
  
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
        ...options.headers,
      },
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error.message);
    }
    
    return data.data;
  }
  
  // Auth
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }
  
  // Restaurants
  async getRestaurants() {
    return this.request('/restaurants');
  }
  
  async createRestaurant(data: CreateRestaurantInput) {
    return this.request('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  // Menu Items
  async getMenuItems(restaurantId: string) {
    return this.request(`/menu/restaurant/${restaurantId}/items`);
  }
  
  async createMenuItem(restaurantId: string, data: CreateItemInput) {
    return this.request(`/menu/restaurant/${restaurantId}/items`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async updateMenuItem(itemId: string, data: UpdateItemInput) {
    return this.request(`/menu/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
  
  async deleteMenuItem(itemId: string) {
    return this.request(`/menu/items/${itemId}`, {
      method: 'DELETE',
    });
  }
}

// Usage
const api = new DynamicMenuAPI('your-jwt-token');
const restaurants = await api.getRestaurants();
```

### cURL Examples

```bash
# Login and get token
TOKEN=$(curl -s -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.data.token')

# Get restaurants
curl -s https://api.yourdomain.com/api/restaurants \
  -H "Authorization: Bearer $TOKEN" | jq

# Create a menu item
curl -s -X POST https://api.yourdomain.com/api/menu/restaurant/$RESTAURANT_ID/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Item",
    "price": 15.99,
    "categoryId": "'$CATEGORY_ID'"
  }' | jq
```

---

## WebSocket Support (Future)

Real-time features will be available via WebSocket connections:

```javascript
const ws = new WebSocket('wss://api.yourdomain.com/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'AUTHENTICATE',
    token: 'your-jwt-token'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle real-time updates
};
```

---

## Request Lifecycle

```
Request
  ↓
Authentication Middleware (if required)
  ↓
Tenant Resolver Middleware
  ↓
Idempotency Middleware (write operations)
  ↓
Controller
  ↓
Service
  ↓
Repository (with tenant filtering)
  ↓
Database
```

### Tenant Resolution Flow

```
Public Menu Request (/api/public/menu/:slug)
  ↓
Extract slug from URL
  ↓
Lookup restaurantId by slug (cached)
  ↓
Attach req.tenant = { restaurantId, slug, isPublic: true }

Authenticated Request (/api/menu/restaurant/:restaurantId)
  ↓
Extract restaurantId from URL
  ↓
Verify user owns restaurant
  ↓
Attach req.tenant = { restaurantId, isPublic: false }

QR Scan Request (/api/public/qr/:code)
  ↓
Extract QR code from URL
  ↓
Lookup restaurantId by QR code (cached)
  ↓
Attach req.tenant = { restaurantId, tableNumber, qrType, isPublic: true }
```

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- Restaurant, Menu, QR Code, Analytics, and Offers modules
- JWT authentication
- Time-based menu support
