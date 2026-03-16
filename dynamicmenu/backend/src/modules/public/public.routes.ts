/**
 * Public API Routes
 * Customer-facing endpoints (no authentication required)
 */

import { Router } from 'express';
import { validateParams } from '@middleware/validate';
import { resolveTenant } from '@middleware/tenantResolver';
import { z } from 'zod';
import { prisma } from '@config/database';
import * as restaurantService from '@modules/restaurant/restaurant.service';
import * as menuService from '@modules/menu/menu.service';
import * as qrService from '@modules/qr/qr.service';

const router = Router();

// Validation schemas
const slugSchema = z.object({
  slug: z.string().min(2),
});

const qrCodeSchema = z.object({
  code: z.string().min(1),
});

// ============================================
// DEMO ENDPOINT
// ============================================

/**
 * GET /api/public/demo
 * Returns the full demo menu for "Bella Vista Trattoria"
 * No authentication required - for marketing/landing page demo
 */
router.get('/demo', async (req, res, next) => {
  try {
    const DEMO_SLUG = 'bella-vista-trattoria';
    
    // Find the demo restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug: DEMO_SLUG },
    });

    if (!restaurant) {
      // If demo restaurant doesn't exist, return mock data
      return res.json({
        success: true,
        data: getMockDemoData(),
      });
    }

    // Get categories with items
    const categories = await menuService.getPublicMenu(restaurant.id);

    res.json({
      success: true,
      data: {
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          description: restaurant.description,
          logo: restaurant.logo,
          primaryColor: restaurant.primaryColor,
          secondaryColor: restaurant.secondaryColor,
          defaultLanguage: restaurant.defaultLanguage,
          supportedLanguages: restaurant.supportedLanguages,
        },
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Mock demo data in case database hasn't been seeded yet
 */
function getMockDemoData() {
  return {
    restaurant: {
      id: 'demo-restaurant',
      name: 'Bella Vista Trattoria',
      slug: 'bella-vista-trattoria',
      description: 'Authentic Italian cuisine with a modern twist. Experience the flavors of Italy in a warm, inviting atmosphere with breathtaking views.',
      logo: null,
      primaryColor: '#FF6B35',
      secondaryColor: '#16A34A',
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'it', 'es', 'fr'],
    },
    categories: [
      {
        id: 'cat-1',
        name: 'Starters',
        description: 'Begin your culinary journey with our authentic Italian appetizers',
        image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&q=80',
        sortOrder: 0,
        items: [
          {
            id: 'item-1',
            name: 'Bruschetta al Pomodoro',
            description: 'Grilled artisan bread topped with fresh tomatoes, garlic, basil, and extra virgin olive oil.',
            price: 9.99,
            comparePrice: null,
            image: 'https://images.unsplash.com/photo-1572695157363-bc31c5b0a89a?w=400&q=80',
            isAvailable: true,
            isFeatured: false,
            isPopular: true,
            sortOrder: 0,
            tags: [
              { id: 'tag-1', name: 'VEGAN', color: '#16A34A', textColor: '#FFFFFF', icon: null },
            ],
          },
          {
            id: 'item-2',
            name: 'Carpaccio di Manzo',
            description: 'Thinly sliced raw beef tenderloin with arugula, parmesan shavings, and lemon olive oil dressing.',
            price: 16.99,
            comparePrice: null,
            image: 'https://images.unsplash.com/photo-1546272989-40c92939c6c3?w=400&q=80',
            isAvailable: true,
            isFeatured: true,
            isPopular: false,
            sortOrder: 1,
            tags: [
              { id: 'tag-4', name: 'GLUTEN_FREE', color: '#3730A3', textColor: '#FFFFFF', icon: null },
              { id: 'tag-6', name: "CHEF'S SPECIAL", color: '#7C3AED', textColor: '#FFFFFF', icon: null },
            ],
          },
          {
            id: 'item-3',
            name: 'Calamari Fritti',
            description: 'Tender calamari rings lightly battered and fried until golden, served with lemon aioli.',
            price: 14.99,
            comparePrice: 17.99,
            image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80',
            isAvailable: true,
            isFeatured: false,
            isPopular: true,
            sortOrder: 2,
            tags: [
              { id: 'tag-5', name: 'POPULAR', color: '#FF6B35', textColor: '#FFFFFF', icon: null },
            ],
          },
        ],
      },
      {
        id: 'cat-2',
        name: 'Pizza',
        description: 'Wood-fired Neapolitan pizzas with the finest ingredients',
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
        sortOrder: 1,
        items: [
          {
            id: 'item-4',
            name: 'Margherita D.O.C.',
            description: 'San Marzano tomato sauce, fresh buffalo mozzarella D.O.C., fresh basil, and extra virgin olive oil.',
            price: 15.99,
            comparePrice: null,
            image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
            isAvailable: true,
            isFeatured: true,
            isPopular: true,
            sortOrder: 0,
            tags: [
              { id: 'tag-2', name: 'VEGETARIAN', color: '#F59E0B', textColor: '#FFFFFF', icon: null },
              { id: 'tag-5', name: 'POPULAR', color: '#FF6B35', textColor: '#FFFFFF', icon: null },
            ],
          },
          {
            id: 'item-5',
            name: 'Diavola',
            description: 'Spicy salami, mozzarella, San Marzano tomato sauce, and chili flakes for a fiery kick.',
            price: 18.99,
            comparePrice: null,
            image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80',
            isAvailable: true,
            isFeatured: false,
            isPopular: true,
            sortOrder: 1,
            tags: [
              { id: 'tag-3', name: 'SPICY', color: '#DC2626', textColor: '#FFFFFF', icon: null },
            ],
          },
          {
            id: 'item-6',
            name: 'Prosciutto e Rucola',
            description: 'Fresh mozzarella, prosciutto di Parma, arugula, cherry tomatoes, and parmesan shavings.',
            price: 21.99,
            comparePrice: 24.99,
            image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&q=80',
            isAvailable: true,
            isFeatured: true,
            isPopular: true,
            sortOrder: 2,
            tags: [
              { id: 'tag-5', name: 'POPULAR', color: '#FF6B35', textColor: '#FFFFFF', icon: null },
            ],
          },
        ],
      },
      {
        id: 'cat-3',
        name: 'Pasta',
        description: 'Fresh handmade pasta prepared daily by our master chefs',
        image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80',
        sortOrder: 2,
        items: [
          {
            id: 'item-7',
            name: 'Spaghetti alla Carbonara',
            description: 'Classic Roman pasta with eggs, pecorino Romano, guanciale, and freshly cracked black pepper.',
            price: 18.99,
            comparePrice: null,
            image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80',
            isAvailable: true,
            isFeatured: true,
            isPopular: true,
            sortOrder: 0,
            tags: [
              { id: 'tag-5', name: 'POPULAR', color: '#FF6B35', textColor: '#FFFFFF', icon: null },
            ],
          },
          {
            id: 'item-8',
            name: 'Ravioli di Aragosta',
            description: 'House-made lobster ravioli in a delicate saffron cream sauce with fresh herbs.',
            price: 28.99,
            comparePrice: null,
            image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=80',
            isAvailable: true,
            isFeatured: true,
            isPopular: true,
            sortOrder: 1,
            tags: [
              { id: 'tag-6', name: "CHEF'S SPECIAL", color: '#7C3AED', textColor: '#FFFFFF', icon: null },
              { id: 'tag-5', name: 'POPULAR', color: '#FF6B35', textColor: '#FFFFFF', icon: null },
            ],
          },
        ],
      },
      {
        id: 'cat-4',
        name: 'Desserts',
        description: 'Sweet Italian classics to end your meal perfectly',
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
        sortOrder: 3,
        items: [
          {
            id: 'item-9',
            name: 'Tiramisu Classico',
            description: 'Layers of espresso-soaked ladyfingers and mascarpone cream, dusted with cocoa powder.',
            price: 9.99,
            comparePrice: null,
            image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80',
            isAvailable: true,
            isFeatured: true,
            isPopular: true,
            sortOrder: 0,
            tags: [
              { id: 'tag-2', name: 'VEGETARIAN', color: '#F59E0B', textColor: '#FFFFFF', icon: null },
              { id: 'tag-5', name: 'POPULAR', color: '#FF6B35', textColor: '#FFFFFF', icon: null },
            ],
          },
          {
            id: 'item-10',
            name: 'Panna Cotta',
            description: 'Silky vanilla bean custard with wild berry compote and fresh mint.',
            price: 8.99,
            comparePrice: null,
            image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
            isAvailable: true,
            isFeatured: false,
            isPopular: false,
            sortOrder: 1,
            tags: [
              { id: 'tag-4', name: 'GLUTEN_FREE', color: '#3730A3', textColor: '#FFFFFF', icon: null },
              { id: 'tag-2', name: 'VEGETARIAN', color: '#F59E0B', textColor: '#FFFFFF', icon: null },
            ],
          },
        ],
      },
      {
        id: 'cat-5',
        name: 'Drinks',
        description: 'Refreshing beverages, Italian wines, and signature cocktails',
        image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
        sortOrder: 4,
        items: [
          {
            id: 'item-11',
            name: 'Aperol Spritz',
            description: 'Aperol, prosecco, and soda water with a slice of orange. The perfect Italian aperitif.',
            price: 12.99,
            comparePrice: null,
            image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80',
            isAvailable: true,
            isFeatured: true,
            isPopular: true,
            sortOrder: 0,
            tags: [
              { id: 'tag-5', name: 'POPULAR', color: '#FF6B35', textColor: '#FFFFFF', icon: null },
            ],
          },
          {
            id: 'item-12',
            name: 'Limonata Fresca',
            description: 'Freshly squeezed lemonade with mint and a hint of sparkling water.',
            price: 5.99,
            comparePrice: null,
            image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80',
            isAvailable: true,
            isFeatured: false,
            isPopular: true,
            sortOrder: 1,
            tags: [
              { id: 'tag-1', name: 'VEGAN', color: '#16A34A', textColor: '#FFFFFF', icon: null },
            ],
          },
        ],
      },
    ],
  };
}

// Get restaurant info by slug
router.get(
  '/restaurant/:slug',
  validateParams(slugSchema),
  resolveTenant('slug'),
  async (req, res, next) => {
    try {
      const { slug } = req.params;
      const restaurant = await restaurantService.getPublicRestaurant(slug);

      res.json({
        success: true,
        data: {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          description: restaurant.description,
          logo: restaurant.logo,
          address: restaurant.address,
          phone: restaurant.phone,
          email: restaurant.email,
          website: restaurant.website,
          primaryColor: restaurant.primaryColor,
          secondaryColor: restaurant.secondaryColor,
          defaultLanguage: restaurant.defaultLanguage,
          supportedLanguages: restaurant.supportedLanguages,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get full menu for restaurant
router.get(
  '/menu/:slug',
  validateParams(slugSchema),
  resolveTenant('slug'),
  async (req, res, next) => {
    try {
      const { slug } = req.params;
      const restaurant = await restaurantService.getPublicRestaurant(slug);
      const categories = await menuService.getPublicMenu(restaurant.id);

      res.json({
        success: true,
        data: {
          restaurant: {
            id: restaurant.id,
            name: restaurant.name,
            slug: restaurant.slug,
            description: restaurant.description,
            logo: restaurant.logo,
            primaryColor: restaurant.primaryColor,
            secondaryColor: restaurant.secondaryColor,
            defaultLanguage: restaurant.defaultLanguage,
            supportedLanguages: restaurant.supportedLanguages,
          },
          categories,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get currently active menus based on time (breakfast, lunch, dinner, etc.)
router.get(
  '/menu/:slug/current',
  validateParams(slugSchema),
  resolveTenant('slug'),
  async (req, res, next) => {
    try {
      const { slug } = req.params;
      const restaurant = await restaurantService.getPublicRestaurant(slug);
      
      // Get menus that are currently active based on time constraints
      const activeMenus = await menuService.getCurrentlyActiveMenus(restaurant.id);

      res.json({
        success: true,
        data: {
          restaurant: {
            id: restaurant.id,
            name: restaurant.name,
            slug: restaurant.slug,
            description: restaurant.description,
            logo: restaurant.logo,
            primaryColor: restaurant.primaryColor,
            secondaryColor: restaurant.secondaryColor,
            defaultLanguage: restaurant.defaultLanguage,
            supportedLanguages: restaurant.supportedLanguages,
          },
          menus: activeMenus.map((menu) => ({
            id: menu.id,
            name: menu.name,
            description: menu.description,
            type: menu.type,
            isSeasonal: menu.isSeasonal,
            startTime: menu.startTime,
            endTime: menu.endTime,
            daysOfWeek: menu.daysOfWeek,
            startDate: menu.startDate,
            endDate: menu.endDate,
            sortOrder: menu.sortOrder,
          })),
          currentTime: new Date().toISOString(),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get featured items
router.get(
  '/menu/:slug/featured',
  validateParams(slugSchema),
  resolveTenant('slug'),
  async (req, res, next) => {
    try {
      const { slug } = req.params;
      const restaurant = await restaurantService.getPublicRestaurant(slug);
      const items = await menuService.getFeaturedItems(restaurant.id);

      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get popular items
router.get(
  '/menu/:slug/popular',
  validateParams(slugSchema),
  resolveTenant('slug'),
  async (req, res, next) => {
    try {
      const { slug } = req.params;
      const restaurant = await restaurantService.getPublicRestaurant(slug);
      const items = await menuService.getPopularItems(restaurant.id);

      res.json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Process QR code scan
router.get(
  '/qr/:code',
  validateParams(qrCodeSchema),
  resolveTenant('qr'),
  async (req, res, next) => {
    try {
      const { code } = req.params;
      const result = await qrService.processScan(code);

      if (!result) {
        res.status(404).json({
          success: false,
          error: {
            code: 'QR_NOT_FOUND',
            message: 'Invalid QR code',
          },
        });
        return;
      }

      if (!result.valid) {
        res.status(403).json({
          success: false,
          error: {
            code: 'RESTAURANT_UNAVAILABLE',
            message: result.reason,
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          restaurantSlug: result.restaurantSlug,
          restaurantName: result.restaurantName,
          qrType: result.qrType,
          tableNumber: result.tableNumber,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
