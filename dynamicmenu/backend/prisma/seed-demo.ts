/**
 * Demo Restaurant Seed Script
 * Creates "Bella Vista Trattoria" with full Italian menu for demonstration
 */

import { prisma } from '../src/config/database';
import { logger } from '../src/utils/logger';

const DEMO_RESTAURANT_SLUG = 'bella-vista-trattoria';

// Demo restaurant data
const demoRestaurant = {
  name: 'Bella Vista Trattoria',
  slug: DEMO_RESTAURANT_SLUG,
  description: 'Authentic Italian cuisine with a modern twist. Experience the flavors of Italy in a warm, inviting atmosphere with breathtaking views.',
  address: '456 Tuscan Lane, Little Italy, New York, NY 10012',
  phone: '+1 (555) 234-5678',
  email: 'ciao@bellavistatrattoria.com',
  website: 'https://bellavistatrattoria.com',
  primaryColor: '#FF6B35',
  secondaryColor: '#16A34A',
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'it', 'es', 'fr'],
  isActive: true,
  isPublished: true,
};

// Categories with Unsplash images
const categories = [
  {
    name: 'Starters',
    description: 'Begin your culinary journey with our authentic Italian appetizers',
    image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=800&q=80',
    sortOrder: 0,
  },
  {
    name: 'Pizza',
    description: 'Wood-fired Neapolitan pizzas with the finest ingredients',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    sortOrder: 1,
  },
  {
    name: 'Pasta',
    description: 'Fresh handmade pasta prepared daily by our master chefs',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800&q=80',
    sortOrder: 2,
  },
  {
    name: 'Desserts',
    description: 'Sweet Italian classics to end your meal perfectly',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80',
    sortOrder: 3,
  },
  {
    name: 'Drinks',
    description: 'Refreshing beverages, Italian wines, and signature cocktails',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&q=80',
    sortOrder: 4,
  },
];

// Dietary tags
const dietaryTags = [
  { name: 'VEGAN', color: '#16A34A', textColor: '#FFFFFF', icon: 'Leaf' },
  { name: 'VEGETARIAN', color: '#F59E0B', textColor: '#FFFFFF', icon: 'Sprout' },
  { name: 'SPICY', color: '#DC2626', textColor: '#FFFFFF', icon: 'Flame' },
  { name: 'GLUTEN_FREE', color: '#3730A3', textColor: '#FFFFFF', icon: 'WheatOff' },
  { name: 'POPULAR', color: '#FF6B35', textColor: '#FFFFFF', icon: 'TrendingUp' },
  { name: "CHEF'S SPECIAL", color: '#7C3AED', textColor: '#FFFFFF', icon: 'ChefHat' },
];

// Menu items with realistic Italian cuisine
const menuItems = {
  'Starters': [
    {
      name: 'Bruschetta al Pomodoro',
      description: 'Grilled artisan bread topped with fresh tomatoes, garlic, basil, and extra virgin olive oil. A classic Tuscan starter.',
      price: 9.99,
      image: 'https://images.unsplash.com/photo-1572695157363-bc31c5b0a89a?w=400&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: true,
      sortOrder: 0,
      tags: ['VEGAN'],
    },
    {
      name: 'Carpaccio di Manzo',
      description: 'Thinly sliced raw beef tenderloin with arugula, parmesan shavings, capers, and lemon olive oil dressing.',
      price: 16.99,
      image: 'https://images.unsplash.com/photo-1546272989-40c92939c6c3?w=400&q=80',
      isAvailable: true,
      isFeatured: true,
      isPopular: false,
      sortOrder: 1,
      tags: ['GLUTEN_FREE', "CHEF'S SPECIAL"],
    },
    {
      name: 'Arancini Siciliani',
      description: 'Crispy fried risotto balls filled with mozzarella and peas, served with spicy marinara sauce.',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=400&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: true,
      sortOrder: 2,
      tags: ['VEGETARIAN'],
    },
    {
      name: 'Calamari Fritti',
      description: 'Tender calamari rings lightly battered and fried until golden, served with lemon aioli and marinara.',
      price: 14.99,
      comparePrice: 17.99,
      image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: true,
      sortOrder: 3,
      tags: ['POPULAR'],
    },
  ],
  'Pizza': [
    {
      name: 'Margherita D.O.C.',
      description: 'San Marzano tomato sauce, fresh buffalo mozzarella D.O.C., fresh basil, and extra virgin olive oil.',
      price: 15.99,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
      isAvailable: true,
      isFeatured: true,
      isPopular: true,
      sortOrder: 0,
      tags: ['VEGETARIAN', 'POPULAR'],
    },
    {
      name: 'Diavola',
      description: 'Spicy salami, mozzarella, San Marzano tomato sauce, and chili flakes for a fiery kick.',
      price: 18.99,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: true,
      sortOrder: 1,
      tags: ['SPICY'],
    },
    {
      name: 'Quattro Formaggi',
      description: 'Four cheese blend of mozzarella, gorgonzola, parmesan, and fontina with a touch of honey.',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
      isAvailable: true,
      isFeatured: true,
      isPopular: false,
      sortOrder: 2,
      tags: ['VEGETARIAN', "CHEF'S SPECIAL"],
    },
    {
      name: 'Prosciutto e Rucola',
      description: 'Fresh mozzarella, prosciutto di Parma, arugula, cherry tomatoes, and parmesan shavings.',
      price: 21.99,
      comparePrice: 24.99,
      image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=400&q=80',
      isAvailable: true,
      isFeatured: true,
      isPopular: true,
      sortOrder: 3,
      tags: ['POPULAR'],
    },
    {
      name: 'Verdure Grigliate',
      description: 'Grilled zucchini, eggplant, bell peppers, mushrooms, and onions with vegan mozzarella.',
      price: 17.99,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: false,
      sortOrder: 4,
      tags: ['VEGAN'],
    },
  ],
  'Pasta': [
    {
      name: 'Spaghetti alla Carbonara',
      description: 'Classic Roman pasta with eggs, pecorino Romano, guanciale, and freshly cracked black pepper.',
      price: 18.99,
      image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80',
      isAvailable: true,
      isFeatured: true,
      isPopular: true,
      sortOrder: 0,
      tags: ['POPULAR'],
    },
    {
      name: 'Fettuccine Alfredo',
      description: 'House-made fettuccine in a rich, creamy parmesan sauce with butter and black pepper.',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=400&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: true,
      sortOrder: 1,
      tags: ['VEGETARIAN'],
    },
    {
      name: 'Linguine alle Vongole',
      description: 'Fresh clams sautéed with garlic, white wine, chili flakes, and parsley in a light sauce.',
      price: 24.99,
      comparePrice: 28.99,
      image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400&q=80',
      isAvailable: true,
      isFeatured: true,
      isPopular: false,
      sortOrder: 2,
      tags: ["CHEF'S SPECIAL"],
    },
    {
      name: 'Ravioli di Aragosta',
      description: 'House-made lobster ravioli in a delicate saffron cream sauce with fresh herbs.',
      price: 28.99,
      image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=80',
      isAvailable: true,
      isFeatured: true,
      isPopular: true,
      sortOrder: 3,
      tags: ["CHEF'S SPECIAL", 'POPULAR'],
    },
    {
      name: 'Penne all\'Arrabbiata',
      description: 'Penne pasta in a spicy tomato sauce with garlic, chili flakes, and fresh parsley.',
      price: 16.99,
      image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: false,
      sortOrder: 4,
      tags: ['SPICY', 'VEGAN'],
    },
    {
      name: 'Gnocchi al Pesto',
      description: 'House-made potato gnocchi with fresh basil pesto, pine nuts, and parmesan.',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: false,
      sortOrder: 5,
      tags: ['VEGETARIAN'],
    },
  ],
  'Desserts': [
    {
      name: 'Tiramisu Classico',
      description: 'Layers of espresso-soaked ladyfingers and mascarpone cream, dusted with cocoa powder.',
      price: 9.99,
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80',
      isAvailable: true,
      isFeatured: true,
      isPopular: true,
      sortOrder: 0,
      tags: ['VEGETARIAN', 'POPULAR'],
    },
    {
      name: 'Panna Cotta',
      description: 'Silky vanilla bean custard with wild berry compote and fresh mint.',
      price: 8.99,
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: false,
      sortOrder: 1,
      tags: ['GLUTEN_FREE', 'VEGETARIAN'],
    },
    {
      name: 'Cannoli Siciliani',
      description: 'Crispy pastry shells filled with sweet ricotta, chocolate chips, and candied orange.',
      price: 8.99,
      comparePrice: 10.99,
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: true,
      sortOrder: 2,
      tags: ['VEGETARIAN'],
    },
    {
      name: 'Gelato Artigianale',
      description: 'Selection of artisanal gelato: choose from pistachio, hazelnut, stracciatella, or lemon.',
      price: 7.99,
      image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: false,
      sortOrder: 3,
      tags: ['GLUTEN_FREE', 'VEGETARIAN'],
    },
  ],
  'Drinks': [
    {
      name: 'Aperol Spritz',
      description: 'Aperol, prosecco, and soda water with a slice of orange. The perfect Italian aperitif.',
      price: 12.99,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80',
      isAvailable: true,
      isFeatured: true,
      isPopular: true,
      sortOrder: 0,
      tags: ['POPULAR'],
    },
    {
      name: 'Negroni',
      description: 'Gin, Campari, and sweet vermouth, garnished with orange peel. A timeless classic.',
      price: 13.99,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: false,
      sortOrder: 1,
      tags: [],
    },
    {
      name: 'Limonata Fresca',
      description: 'Freshly squeezed lemonade with mint and a hint of sparkling water.',
      price: 5.99,
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: true,
      sortOrder: 2,
      tags: ['VEGAN'],
    },
    {
      name: 'Espresso Doppio',
      description: 'Double shot of premium Italian espresso, rich and full-bodied.',
      price: 4.99,
      image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80',
      isAvailable: true,
      isFeatured: false,
      isPopular: false,
      sortOrder: 3,
      tags: ['VEGAN'],
    },
    {
      name: 'Chianti Classico',
      description: 'A glass of Tuscan red wine with notes of cherry, plum, and spice.',
      price: 11.99,
      comparePrice: 14.99,
      image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80',
      isAvailable: true,
      isFeatured: true,
      isPopular: false,
      sortOrder: 4,
      tags: ['VEGAN', "CHEF'S SPECIAL"],
    },
  ],
};

async function seedDemoData() {
  logger.info('Starting demo data seed...');

  try {
    // Check if demo restaurant already exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { slug: DEMO_RESTAURANT_SLUG },
    });

    if (existingRestaurant) {
      logger.info('Demo restaurant already exists, skipping seed...');
      return;
    }

    // Create tags first
    logger.info('Creating dietary tags...');
    const createdTags: Record<string, string> = {};
    for (const tag of dietaryTags) {
      const created = await prisma.menuItemTag.create({
        data: tag,
      });
      createdTags[tag.name] = created.id;
    }
    logger.info(`Created ${Object.keys(createdTags).length} dietary tags`);

    // Create demo user/owner
    logger.info('Creating demo user...');
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@dynamicmenu.app' },
      update: {},
      create: {
        email: 'demo@dynamicmenu.app',
        password: '$2a$10$YourHashedPasswordHere', // In production, use proper hashing
        firstName: 'Demo',
        lastName: 'Owner',
        role: 'OWNER',
      },
    });

    // Create demo restaurant
    logger.info('Creating demo restaurant...');
    const restaurant = await prisma.restaurant.create({
      data: {
        ...demoRestaurant,
        ownerId: demoUser.id,
      },
    });

    // Create categories and their items
    logger.info('Creating categories and menu items...');
    for (const categoryData of categories) {
      const category = await prisma.category.create({
        data: {
          name: categoryData.name,
          description: categoryData.description,
          image: categoryData.image,
          sortOrder: categoryData.sortOrder,
          restaurantId: restaurant.id,
        },
      });

      // Create menu items for this category
      const items = menuItems[categoryData.name as keyof typeof menuItems] || [];
      for (const itemData of items) {
        const tagIds = itemData.tags
          .map((tagName) => createdTags[tagName])
          .filter(Boolean);

        await prisma.menuItem.create({
          data: {
            name: itemData.name,
            description: itemData.description,
            price: itemData.price,
            comparePrice: itemData.comparePrice,
            image: itemData.image,
            isAvailable: itemData.isAvailable,
            isFeatured: itemData.isFeatured,
            isPopular: itemData.isPopular,
            sortOrder: itemData.sortOrder,
            categoryId: category.id,
            restaurantId: restaurant.id,
            tags: {
              connect: tagIds.map((id) => ({ id })),
            },
          },
        });
      }

      logger.info(`Created category "${category.name}" with ${items.length} items`);
    }

    // Create a demo QR code
    logger.info('Creating demo QR code...');
    await prisma.qRCode.create({
      data: {
        name: 'Demo Table 1',
        type: 'TABLE',
        code: `demo-${restaurant.id}-table-1`,
        tableNumber: 1,
        restaurantId: restaurant.id,
      },
    });

    logger.info('Demo data seeded successfully!');
    logger.info(`Restaurant slug: ${DEMO_RESTAURANT_SLUG}`);
    logger.info(`View menu at: /menu/${DEMO_RESTAURANT_SLUG}`);
  } catch (error) {
    logger.error('Error seeding demo data:', error as Error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed if executed directly
if (require.main === module) {
  seedDemoData();
}

export { seedDemoData };
