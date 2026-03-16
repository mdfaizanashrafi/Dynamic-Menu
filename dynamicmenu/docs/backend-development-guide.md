# Backend Development Guide

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn
- Git

### Installation

```bash
cd backend
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dynamicmenu?schema=public"

# Server
PORT=3001
NODE_ENV=development
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
```

### Database Setup

```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Open Prisma Studio (optional)
npx prisma studio
```

### Development

```bash
# Start development server with hot reload
npm run dev

# Run tests
npm test

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

## Module Development

### Creating a New Module

1. Create module directory:
```bash
mkdir src/modules/feature
```

2. Create files:
```
feature/
├── feature.types.ts
├── feature.repository.ts
├── feature.service.ts
├── feature.controller.ts
└── feature.routes.ts
```

### Module Template

#### Types (feature.types.ts)

```typescript
import { z } from 'zod';

// ============================================
// Validation Schemas
// ============================================

export const createFeatureSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
});

export const updateFeatureSchema = createFeatureSchema.partial();

export const featureParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listFeaturesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
});

// ============================================
// Type Exports
// ============================================

export type CreateFeatureInput = z.infer<typeof createFeatureSchema>;
export type UpdateFeatureInput = z.infer<typeof updateFeatureSchema>;
export type ListFeaturesQuery = z.infer<typeof listFeaturesQuerySchema>;

export interface FeatureResponse {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Repository (feature.repository.ts)

```typescript
import { prisma } from '@config/database';
import { NotFoundError } from '@utils/errors';
import { 
  CreateFeatureInput, 
  UpdateFeatureInput, 
  ListFeaturesQuery,
  FeatureResponse 
} from './feature.types';

// ============================================
// Default Selection
// ============================================

const defaultSelect = {
  id: true,
  name: true,
  description: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

// ============================================
// CRUD Operations
// ============================================

/**
 * Find a feature by ID
 * @throws NotFoundError if feature not found
 */
export const findById = async (id: string): Promise<FeatureResponse> => {
  const feature = await prisma.feature.findUnique({
    where: { id },
    select: defaultSelect,
  });
  
  if (!feature) {
    throw new NotFoundError('Feature', id);
  }
  
  return feature;
};

/**
 * List features with pagination and filtering
 */
export const findMany = async (
  restaurantId: string,
  query: ListFeaturesQuery
): Promise<{ items: FeatureResponse[]; total: number }> => {
  const { page, limit, search, isActive } = query;
  const skip = (page - 1) * limit;
  
  const where = {
    restaurantId,
    ...(search && {
      name: { contains: search, mode: 'insensitive' as const },
    }),
    ...(isActive !== undefined && { isActive }),
  };
  
  const [items, total] = await Promise.all([
    prisma.feature.findMany({
      where,
      select: defaultSelect,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.feature.count({ where }),
  ]);
  
  return { items, total };
};

/**
 * Create a new feature
 */
export const create = async (
  restaurantId: string,
  data: CreateFeatureInput
): Promise<FeatureResponse> => {
  return prisma.feature.create({
    data: {
      ...data,
      restaurantId,
    },
    select: defaultSelect,
  });
};

/**
 * Update a feature
 * @throws NotFoundError if feature not found
 */
export const update = async (
  id: string,
  data: UpdateFeatureInput
): Promise<FeatureResponse> => {
  try {
    return await prisma.feature.update({
      where: { id },
      data,
      select: defaultSelect,
    });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundError('Feature', id);
    }
    throw error;
  }
};

/**
 * Delete a feature
 * @throws NotFoundError if feature not found
 */
export const remove = async (id: string): Promise<void> => {
  try {
    await prisma.feature.delete({ where: { id } });
  } catch (error) {
    if (error.code === 'P2025') {
      throw new NotFoundError('Feature', id);
    }
    throw error;
  }
};

// ============================================
// Specialized Queries
// ============================================

/**
 * Count active features for a restaurant
 */
export const countActive = async (restaurantId: string): Promise<number> => {
  return prisma.feature.count({
    where: {
      restaurantId,
      isActive: true,
    },
  });
};
```

#### Service (feature.service.ts)

```typescript
import * as repository from './feature.repository';
import { 
  CreateFeatureInput, 
  UpdateFeatureInput,
  ListFeaturesQuery 
} from './feature.types';
import { logger } from '@utils/logger';
import { ConflictError } from '@utils/errors';

// ============================================
// Business Logic
// ============================================

/**
 * Create a new feature with business rule validation
 */
export const createFeature = async (
  restaurantId: string,
  data: CreateFeatureInput
) => {
  // Check for duplicate names
  const existingCount = await repository.countActive(restaurantId);
  if (existingCount >= 100) {
    throw new ConflictError('Maximum number of features reached');
  }
  
  const feature = await repository.create(restaurantId, data);
  
  logger.info('Feature created', { 
    featureId: feature.id, 
    restaurantId,
    name: feature.name 
  });
  
  return feature;
};

/**
 * Get feature by ID
 */
export const getFeatureById = async (id: string) => {
  return repository.findById(id);
};

/**
 * List features with pagination
 */
export const listFeatures = async (
  restaurantId: string,
  query: ListFeaturesQuery
) => {
  return repository.findMany(restaurantId, query);
};

/**
 * Update feature
 */
export const updateFeature = async (
  id: string,
  data: UpdateFeatureInput
) => {
  const feature = await repository.update(id, data);
  
  logger.info('Feature updated', { 
    featureId: id,
    updates: Object.keys(data)
  });
  
  return feature;
};

/**
 * Delete feature
 */
export const deleteFeature = async (id: string) => {
  await repository.remove(id);
  
  logger.info('Feature deleted', { featureId: id });
};
```

#### Controller (feature.controller.ts)

```typescript
import { Request, Response, NextFunction } from 'express';
import * as service from './feature.service';
import { 
  CreateFeatureInput, 
  UpdateFeatureInput,
  ListFeaturesQuery 
} from './feature.types';

// ============================================
// Request Handlers
// ============================================

/**
 * POST /api/features
 * Create a new feature
 */
export const create = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { restaurantId } = req.user!; // From auth middleware
    const data = req.body as CreateFeatureInput;
    
    const feature = await service.createFeature(restaurantId, data);
    
    res.status(201).json({
      success: true,
      data: feature,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/features
 * List features with pagination
 */
export const list = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { restaurantId } = req.user!;
    const query = req.query as unknown as ListFeaturesQuery;
    
    const { items, total } = await service.listFeatures(restaurantId, query);
    
    const { page, limit } = query;
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/features/:id
 * Get feature by ID
 */
export const getById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const feature = await service.getFeatureById(id);
    
    res.json({
      success: true,
      data: feature,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/features/:id
 * Update feature
 */
export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateFeatureInput;
    
    const feature = await service.updateFeature(id, data);
    
    res.json({
      success: true,
      data: feature,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/features/:id
 * Delete feature
 */
export const remove = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await service.deleteFeature(id);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
```

#### Routes (feature.routes.ts)

```typescript
import { Router } from 'express';
import { authenticate, authorize } from '@middleware/auth';
import { validateBody, validateParams, validateQuery } from '@middleware/validate';
import * as controller from './feature.controller';
import { 
  createFeatureSchema, 
  updateFeatureSchema, 
  featureParamsSchema,
  listFeaturesQuerySchema 
} from './feature.types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// List and create
router.get(
  '/',
  validateQuery(listFeaturesQuerySchema),
  controller.list
);

router.post(
  '/',
  authorize('OWNER', 'MANAGER'),
  validateBody(createFeatureSchema),
  controller.create
);

// Single resource operations
router.get(
  '/:id',
  validateParams(featureParamsSchema),
  controller.getById
);

router.patch(
  '/:id',
  authorize('OWNER', 'MANAGER'),
  validateParams(featureParamsSchema),
  validateBody(updateFeatureSchema),
  controller.update
);

router.delete(
  '/:id',
  authorize('OWNER'),
  validateParams(featureParamsSchema),
  controller.remove
);

export default router;
```

## Error Handling Patterns

### Error Hierarchy

```
AppError (base)
├── NotFoundError (404)
├── ValidationError (400)
├── UnauthorizedError (401)
├── ForbiddenError (403)
├── ConflictError (409)
├── RateLimitError (429)
├── DatabaseError (503)
└── ServiceUnavailableError (503)
```

### Throwing Errors

```typescript
import { 
  NotFoundError, 
  ValidationError, 
  ConflictError,
  ForbiddenError 
} from '@utils/errors';

// Not found error
const getUser = async (id: string) => {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundError('User', id);
  }
  return user;
};

// Validation error with details
const validateOrder = (data: OrderInput) => {
  const errors: Record<string, string> = {};
  
  if (data.quantity < 1) {
    errors.quantity = 'Quantity must be at least 1';
  }
  if (data.price <= 0) {
    errors.price = 'Price must be greater than 0';
  }
  
  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Invalid order data', errors);
  }
};

// Conflict error
const createUser = async (email: string) => {
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError(`User with email '${email}' already exists`);
  }
  // ... create user
};

// Forbidden error
const deleteRestaurant = async (user: User, restaurantId: string) => {
  const restaurant = await getRestaurant(restaurantId);
  
  if (restaurant.ownerId !== user.id && user.role !== 'ADMIN') {
    throw new ForbiddenError('You do not have permission to delete this restaurant');
  }
  // ... delete restaurant
};
```

### Error Handler Middleware

The global error handler (`middleware/errorHandler.ts`) automatically:

1. Maps Prisma errors to HTTP responses
2. Formats all errors consistently
3. Logs errors with appropriate severity
4. Prevents information leakage in production

```typescript
// Example: Prisma error mapping
const PRISMA_ERROR_MAP = {
  P2002: { code: 'DUPLICATE_ENTRY', status: 409 },
  P2025: { code: 'NOT_FOUND', status: 404 },
  P2003: { code: 'CONSTRAINT_VIOLATION', status: 409 },
};

// Error response format
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data',
    details: {
      email: 'Must be a valid email address',
      password: 'Must be at least 8 characters'
    }
  }
}
```

### Async Error Handling

Always use try-catch in controllers and pass errors to `next()`:

```typescript
// ✅ Good
export const create = async (req, res, next) => {
  try {
    const result = await service.create(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ❌ Bad - unhandled promise rejection
export const create = async (req, res) => {
  const result = await service.create(req.body); // May throw!
  res.json({ success: true, data: result });
};
```

## Testing Guidelines

### Test Structure

```
src/
└── modules/
    └── feature/
        ├── feature.types.ts
        ├── feature.repository.ts
        ├── feature.service.ts
        ├── feature.controller.ts
        ├── feature.routes.ts
        └── __tests__/
            ├── feature.service.test.ts
            └── feature.repository.test.ts
```

### Service Testing

```typescript
// feature.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as service from '../feature.service';
import * as repository from '../feature.repository';
import { ConflictError, NotFoundError } from '@utils/errors';

// Mock the repository
vi.mock('../feature.repository');

describe('FeatureService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createFeature', () => {
    it('should create a new feature', async () => {
      const mockData = { 
        name: 'Test Feature', 
        description: 'Test description',
        isActive: true 
      };
      const mockResult = { 
        id: '1', 
        ...mockData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      vi.mocked(repository.countActive).mockResolvedValue(0);
      vi.mocked(repository.create).mockResolvedValue(mockResult);
      
      const result = await service.createFeature('restaurant-1', mockData);
      
      expect(result).toEqual(mockResult);
      expect(repository.create).toHaveBeenCalledWith('restaurant-1', mockData);
    });

    it('should throw ConflictError when max features reached', async () => {
      vi.mocked(repository.countActive).mockResolvedValue(100);
      
      await expect(
        service.createFeature('restaurant-1', { name: 'Test' } as any)
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('getFeatureById', () => {
    it('should return feature when found', async () => {
      const mockFeature = { 
        id: '1', 
        name: 'Test',
        isActive: true 
      };
      vi.mocked(repository.findById).mockResolvedValue(mockFeature as any);
      
      const result = await service.getFeatureById('1');
      
      expect(result).toEqual(mockFeature);
    });

    it('should throw NotFoundError when feature not found', async () => {
      vi.mocked(repository.findById).mockRejectedValue(
        new NotFoundError('Feature', '999')
      );
      
      await expect(service.getFeatureById('999')).rejects.toThrow(NotFoundError);
    });
  });

  describe('listFeatures', () => {
    it('should return paginated results', async () => {
      const mockItems = [
        { id: '1', name: 'Feature 1' },
        { id: '2', name: 'Feature 2' },
      ];
      
      vi.mocked(repository.findMany).mockResolvedValue({
        items: mockItems as any,
        total: 2,
      });
      
      const result = await service.listFeatures('restaurant-1', {
        page: 1,
        limit: 10,
      });
      
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });
  });
});
```

### Repository Testing

```typescript
// feature.repository.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@config/database';
import * as repository from '../feature.repository';
import { NotFoundError } from '@utils/errors';

// Integration test with test database
describe('FeatureRepository', () => {
  beforeEach(async () => {
    await prisma.feature.deleteMany();
  });

  describe('create', () => {
    it('should create a feature', async () => {
      const data = {
        name: 'Test Feature',
        description: 'Test description',
        isActive: true,
      };
      
      const result = await repository.create('restaurant-1', data);
      
      expect(result.name).toBe(data.name);
      expect(result.id).toBeDefined();
    });
  });

  describe('findById', () => {
    it('should throw NotFoundError for non-existent id', async () => {
      await expect(
        repository.findById('non-existent-id')
      ).rejects.toThrow(NotFoundError);
    });
  });
});
```

### Controller Testing

```typescript
// feature.controller.test.ts
import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import * as controller from '../feature.controller';
import * as service from '../feature.service';

vi.mock('../feature.service');

describe('FeatureController', () => {
  const mockReq = (body = {}, params = {}, query = {}, user = { restaurantId: '1' }) => ({
    body,
    params,
    query,
    user,
  }) as unknown as Request;

  const mockRes = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res as Response;
  };

  const mockNext = vi.fn() as NextFunction;

  describe('create', () => {
    it('should create feature and return 201', async () => {
      const req = mockReq({ name: 'Test' });
      const res = mockRes();
      const mockFeature = { id: '1', name: 'Test' };
      
      vi.mocked(service.createFeature).mockResolvedValue(mockFeature as any);
      
      await controller.create(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockFeature,
      });
    });

    it('should call next with error on failure', async () => {
      const req = mockReq({ name: 'Test' });
      const res = mockRes();
      const error = new Error('Database error');
      
      vi.mocked(service.createFeature).mockRejectedValue(error);
      
      await controller.create(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- feature.service.test.ts

# Run in watch mode
npm run test:watch
```

## Code Standards

### Naming Conventions

- **Files**: kebab-case.ts (e.g., `user-service.ts`)
- **Functions**: camelCase (e.g., `getUserById`)
- **Classes**: PascalCase (e.g., `UserService`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Types/Interfaces**: PascalCase (e.g., `UserResponse`)

### Function Guidelines

```typescript
// ✅ Good: Single responsibility, 5-20 lines
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// ✅ Good: Descriptive name, clear purpose
const isMenuCurrentlyActive = (menu: Menu): boolean => {
  const now = new Date();
  const currentHour = now.getHours();
  const [startHour] = menu.startTime.split(':').map(Number);
  const [endHour] = menu.endTime.split(':').map(Number);
  return currentHour >= startHour && currentHour < endHour;
};

// ❌ Bad: Multiple responsibilities, too long
const processOrder = (order: Order) => {
  // validate
  // calculate
  // save to db
  // send email
  // update inventory
  // log
  // ... 50 more lines
};
```

### Logging

```typescript
import { logger, logInfo, logError } from '@utils/logger';

// Info logging
logInfo('User created', { userId: '123', email: 'user@example.com' });

// Error logging
logError('Database connection failed', error, { service: 'auth' });

// Never log sensitive data
// ❌ Bad
logger.info('Login attempt', { password: userInput.password });

// ✅ Good
logger.info('Login successful', { userId: user.id, email: user.email });
```

## Database

### Migrations

```bash
# Create migration
npx prisma migrate dev --name add_user_table

# Deploy to production
npx prisma migrate deploy

# Reset (development only)
npx prisma migrate reset

# Check migration status
npx prisma migrate status
```

### Seeding

```typescript
// prisma/seed.ts
import { prisma } from '../src/config/database';
import { hashPassword } from '../src/utils/password';

async function main() {
  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: await hashPassword('admin123'),
      firstName: 'Admin',
      lastName: 'User',
      role: 'OWNER',
    },
  });

  // Create sample restaurant
  const restaurant = await prisma.restaurant.create({
    data: {
      slug: 'sample-restaurant',
      name: 'Sample Restaurant',
      description: 'A sample restaurant for testing',
      ownerId: admin.id,
    },
  });

  console.log('Seeded:', { admin: admin.id, restaurant: restaurant.id });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Run seed:
```bash
npx prisma db seed
```

## API Documentation

### Documenting Routes

```typescript
/**
 * @route POST /api/features
 * @description Create a new feature for the restaurant
 * @access Private (Owner, Manager)
 * 
 * @example Request:
 * POST /api/features
 * {
 *   "name": "Outdoor Seating",
 *   "description": "Tables available in outdoor area",
 *   "isActive": true
 * }
 * 
 * @example Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "uuid",
 *     "name": "Outdoor Seating",
 *     "description": "Tables available in outdoor area",
 *     "isActive": true,
 *     "createdAt": "2024-01-01T00:00:00Z",
 *     "updatedAt": "2024-01-01T00:00:00Z"
 *   }
 * }
 * 
 * @error 409 - Maximum number of features reached
 * @error 400 - Invalid input data
 * @error 401 - Unauthorized
 */
router.post('/', authenticate, controller.create);
```

## Deployment

### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Generate Prisma client
RUN npx prisma generate

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start
CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/dynamicmenu
      - JWT_SECRET=${JWT_SECRET}
      - NODE_ENV=production
    depends_on:
      - db
      - redis

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=dynamicmenu
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

See [deployment-guide.md](./deployment-guide.md) for complete deployment instructions.
