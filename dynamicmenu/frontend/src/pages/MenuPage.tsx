/**
 * Customer Menu Page
 * Public-facing digital menu accessed via QR code
 * Enhanced with SEO, mobile-first design, and behavioral psychology elements
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  MapPin, Phone, Clock, Globe, Search, RefreshCw, 
  Star, Flame, Leaf, WheatOff, Info, ChefHat, 
  TrendingUp, AlertCircle, X, ChevronDown, ChevronUp,
  UtensilsCrossed
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

interface Tag {
  id: string;
  name: string;
  color: string;
  textColor: string;
  icon?: string | null;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  image?: string;
  images?: string[];
  isAvailable: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  sortOrder: number;
  categoryId: string;
  tags?: Tag[];
  translations?: Record<string, any>;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  sortOrder: number;
  items: MenuItem[];
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  primaryColor: string;
  secondaryColor: string;
  defaultLanguage: string;
  supportedLanguages: string[];
}

interface MenuData {
  restaurant: Restaurant;
  categories: Category[];
}

// ============================================
// Constants & Design Tokens
// ============================================

const DESIGN_TOKENS = {
  primary: '#FF6B35',
  accent: '#16A34A',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  text: {
    primary: '#1A1A1A',
    secondary: '#6B7280',
    muted: '#9CA3AF',
  },
  badges: {
    vegan: { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' },
    vegetarian: { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
    spicy: { bg: '#FEE2E2', text: '#991B1B', border: '#FCA5A5' },
    glutenFree: { bg: '#E0E7FF', text: '#3730A3', border: '#A5B4FC' },
    chefSpecial: { bg: '#F3E8FF', text: '#6B21A8', border: '#D8B4FE' },
  }
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية',
  hi: 'हिन्दी',
};

// ============================================
// Utility Functions
// ============================================

const formatPrice = (price: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price);
};

const getTagBadgeStyle = (tagName: string): { bg: string; text: string; border: string } => {
  const name = tagName.toLowerCase();
  if (name.includes('vegan')) return DESIGN_TOKENS.badges.vegan;
  if (name.includes('vegetarian')) return DESIGN_TOKENS.badges.vegetarian;
  if (name.includes('spicy')) return DESIGN_TOKENS.badges.spicy;
  if (name.includes('gluten')) return DESIGN_TOKENS.badges.glutenFree;
  if (name.includes('chef')) return DESIGN_TOKENS.badges.chefSpecial;
  return { bg: '#F3F4F6', text: '#374151', border: '#D1D5DB' };
};

// ============================================
// SEO Hook
// ============================================

const useSEO = (restaurant: Restaurant | null) => {
  useEffect(() => {
    if (!restaurant) return;

    // Update document title
    document.title = `${restaurant.name} | Digital Menu`;

    // Update or create meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const description = restaurant.description 
      ? `${restaurant.description} - View our digital menu and order your favorites.`
      : `View ${restaurant.name}'s digital menu. Browse our delicious offerings and order your favorites.`;
    
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = description;
      document.head.appendChild(newMeta);
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
    const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
    const ogImage = document.querySelector('meta[property="og:image"]') || document.createElement('meta');
    
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', restaurant.name);
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', description);
    ogImage.setAttribute('property', 'og:image');
    ogImage.setAttribute('content', restaurant.logo || '/default-restaurant.jpg');

    if (!document.querySelector('meta[property="og:title"]')) document.head.appendChild(ogTitle);
    if (!document.querySelector('meta[property="og:description"]')) document.head.appendChild(ogDescription);
    if (!document.querySelector('meta[property="og:image"]')) document.head.appendChild(ogImage);

    // Cleanup
    return () => {
      document.title = 'DynamicMenu';
    };
  }, [restaurant]);
};

// ============================================
// Components
// ============================================

/**
 * Tag Icon Component
 * Returns appropriate icon for dietary tags
 */
const TagIcon = ({ name, className = 'w-3 h-3' }: { name: string; className?: string }) => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes('vegan') || nameLower.includes('vegetarian')) {
    return <Leaf className={className} />;
  }
  if (nameLower.includes('spicy')) {
    return <Flame className={className} />;
  }
  if (nameLower.includes('gluten')) {
    return <WheatOff className={className} />;
  }
  if (nameLower.includes('chef')) {
    return <ChefHat className={className} />;
  }
  return <Star className={className} />;
};

/**
 * Dietary Tag Badge
 * Styled badge for dietary information
 */
const DietaryTag = ({ tag }: { tag: Tag }) => {
  const style = getTagBadgeStyle(tag.name);
  
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border"
      style={{ 
        backgroundColor: style.bg, 
        color: style.text,
        borderColor: style.border 
      }}
    >
      <TagIcon name={tag.name} />
      {tag.name}
    </span>
  );
};

/**
 * Special Badge Component
 * Popular and Chef's Special badges
 */
const SpecialBadge = ({ 
  type, 
  primaryColor 
}: { 
  type: 'popular' | 'chefSpecial'; 
  primaryColor: string;
}) => {
  if (type === 'popular') {
    return (
      <Badge 
        className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-2.5 py-1 shadow-sm"
      >
        <Flame className="w-3 h-3 mr-1" />
        Popular
      </Badge>
    );
  }
  
  return (
    <Badge 
      className="text-white text-xs font-semibold px-2.5 py-1 shadow-sm"
      style={{ backgroundColor: primaryColor }}
    >
      <ChefHat className="w-3 h-3 mr-1" />
      Chef's Special
    </Badge>
  );
};

/**
 * Menu Item Card
 * Enhanced card with behavioral psychology elements
 */
const MenuItemCard = ({ 
  item, 
  primaryColor,
  currency = 'USD'
}: { 
  item: MenuItem; 
  primaryColor: string;
  currency?: string;
}) => {
  const hasDiscount = item.comparePrice && item.comparePrice > item.price;
  const discountPercent = hasDiscount 
    ? Math.round(((item.comparePrice! - item.price) / item.comparePrice!) * 100)
    : 0;

  return (
    <div 
      className={cn(
        "group relative flex gap-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-100",
        "transition-all duration-200 ease-out",
        "hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5",
        "active:scale-[0.99]",
        !item.isAvailable && "opacity-60 grayscale"
      )}
    >
      {/* Image Container */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <UtensilsCrossed className="w-8 h-8 text-gray-300" />
          </div>
        )}
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            -{discountPercent}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight">
                {item.name}
              </h3>
              {item.isPopular && <SpecialBadge type="popular" primaryColor={primaryColor} />}
              {item.isFeatured && !item.isPopular && (
                <SpecialBadge type="chefSpecial" primaryColor={primaryColor} />
              )}
            </div>
            
            {item.description && (
              <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
          
          {/* Price Section - Price Anchoring */}
          <div className="text-right flex-shrink-0 pl-2">
            <span 
              className="block font-bold text-lg sm:text-xl"
              style={{ color: primaryColor }}
            >
              {formatPrice(item.price, currency)}
            </span>
            {hasDiscount && (
              <span className="block text-sm text-gray-400 line-through">
                {formatPrice(item.comparePrice!, currency)}
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {item.tags.map((tag) => (
              <DietaryTag key={tag.id} tag={tag} />
            ))}
          </div>
        )}

        {/* Out of Stock Indicator */}
        {!item.isAvailable && (
          <div className="mt-3 flex items-center gap-1.5 text-sm text-red-500 font-medium">
            <Info className="w-4 h-4" />
            Currently unavailable
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Featured Item Card (Larger, more prominent)
 */
const FeaturedItemCard = ({ 
  item, 
  primaryColor,
  currency = 'USD'
}: { 
  item: MenuItem; 
  primaryColor: string;
  currency?: string;
}) => {
  return (
    <div 
      className={cn(
        "group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden",
        "transition-all duration-200 ease-out",
        "hover:shadow-lg hover:border-gray-200"
      )}
    >
      {/* Image */}
      <div className="relative h-40 sm:h-48 bg-gray-100 overflow-hidden">
        {item.image ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <UtensilsCrossed className="w-12 h-12 text-gray-300" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {item.isPopular && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
              <Flame className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
        </div>
        
        {item.comparePrice && item.comparePrice > item.price && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Save {formatPrice(item.comparePrice - item.price, currency)}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
            )}
          </div>
          <div className="text-right">
            <span 
              className="font-bold text-xl"
              style={{ color: primaryColor }}
            >
              {formatPrice(item.price, currency)}
            </span>
            {item.comparePrice && (
              <span className="block text-sm text-gray-400 line-through">
                {formatPrice(item.comparePrice, currency)}
              </span>
            )}
          </div>
        </div>
        
        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {item.tags.slice(0, 3).map((tag) => (
              <DietaryTag key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Loading Skeleton Component
 */
const MenuSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header Skeleton */}
    <div className="h-16 bg-gray-200 animate-pulse" />
    
    {/* Restaurant Info Skeleton */}
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex gap-4">
        <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    </div>
    
    {/* Category Pills Skeleton */}
    <div className="px-4 py-4">
      <div className="flex gap-2 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
        ))}
      </div>
    </div>
    
    {/* Items Skeleton */}
    <div className="px-4 space-y-4 pb-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-gray-100">
          <Skeleton className="w-24 h-24 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Error State Component
 */
const ErrorState = ({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry: () => void;
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <Button 
        onClick={onRetry}
        className="gap-2"
        style={{ backgroundColor: DESIGN_TOKENS.primary }}
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  </div>
);

/**
 * Restaurant Not Found Component
 */
const RestaurantNotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center max-w-md">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
        <UtensilsCrossed className="w-10 h-10 text-gray-400" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurant Not Found</h1>
      <p className="text-gray-600">
        The menu you're looking for doesn't exist or is no longer available.
      </p>
    </div>
  </div>
);

// ============================================
// Main Component
// ============================================

const MenuPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  // State
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [language, setLanguage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // SEO
  useSEO(menuData?.restaurant || null);

  // Initialize language from restaurant
  useEffect(() => {
    if (menuData?.restaurant) {
      setLanguage(menuData.restaurant.defaultLanguage);
    }
  }, [menuData?.restaurant]);

  // Fetch menu data
  const fetchMenuData = useCallback(async () => {
    if (!slug) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // In production, this would be: const response = await fetch(`/api/public/menu/${slug}`);
      // For now, we'll simulate with a timeout to show loading state
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      // Mock data for demonstration
      const mockData: MenuData = {
        restaurant: {
          id: '1',
          name: 'Bella Vista',
          slug: 'bella-vista',
          description: 'Authentic Italian cuisine with a modern twist. Experience the flavors of Italy in a warm, inviting atmosphere.',
          logo: '',
          address: '123 Main Street, New York, NY 10001',
          phone: '+1 (555) 123-4567',
          email: 'hello@bellavista.com',
          website: 'https://bellavista.example.com',
          primaryColor: '#FF6B35',
          secondaryColor: '#16A34A',
          defaultLanguage: 'en',
          supportedLanguages: ['en', 'es', 'it'],
        },
        categories: [
          {
            id: '1',
            name: 'Starters',
            description: 'Begin your culinary journey',
            sortOrder: 0,
            items: [
              {
                id: '1',
                name: 'Bruschetta Classica',
                description: 'Grilled artisan bread topped with fresh tomatoes, garlic, basil, and extra virgin olive oil',
                price: 8.99,
                isAvailable: true,
                isFeatured: true,
                isPopular: true,
                sortOrder: 0,
                categoryId: '1',
                tags: [
                  { id: '1', name: 'VEGAN', color: '#16A34A', textColor: '#FFFFFF' },
                  { id: '2', name: 'GLUTEN_FREE', color: '#3730A3', textColor: '#FFFFFF' },
                ],
              },
              {
                id: '2',
                name: 'Calamari Fritti',
                description: 'Crispy fried squid served with lemon aioli and marinara sauce',
                price: 12.99,
                comparePrice: 15.99,
                isAvailable: true,
                isFeatured: false,
                isPopular: true,
                sortOrder: 1,
                categoryId: '1',
                tags: [],
              },
              {
                id: '3',
                name: 'Burrata e Pomodoro',
                description: 'Creamy burrata cheese with heirloom tomatoes and balsamic glaze',
                price: 14.99,
                isAvailable: true,
                isFeatured: true,
                isPopular: false,
                sortOrder: 2,
                categoryId: '1',
                tags: [
                  { id: '3', name: 'VEGETARIAN', color: '#F59E0B', textColor: '#FFFFFF' },
                ],
              },
            ],
          },
          {
            id: '2',
            name: 'Pizza',
            description: 'Wood-fired Neapolitan pizzas',
            sortOrder: 1,
            items: [
              {
                id: '4',
                name: 'Margherita DOP',
                description: 'San Marzano tomatoes, fresh mozzarella di bufala, basil, and extra virgin olive oil',
                price: 14.99,
                comparePrice: 17.99,
                isAvailable: true,
                isFeatured: true,
                isPopular: true,
                sortOrder: 0,
                categoryId: '2',
                tags: [
                  { id: '3', name: 'VEGETARIAN', color: '#F59E0B', textColor: '#FFFFFF' },
                ],
              },
              {
                id: '5',
                name: 'Diavola',
                description: 'Spicy salami, mozzarella, tomato sauce, and chili flakes',
                price: 16.99,
                isAvailable: true,
                isFeatured: false,
                isPopular: true,
                sortOrder: 1,
                categoryId: '2',
                tags: [
                  { id: '4', name: 'SPICY', color: '#DC2626', textColor: '#FFFFFF' },
                ],
              },
              {
                id: '6',
                name: 'Quattro Formaggi',
                description: 'Four cheese blend with mozzarella, gorgonzola, parmesan, and fontina',
                price: 17.99,
                isAvailable: true,
                isFeatured: true,
                isPopular: false,
                sortOrder: 2,
                categoryId: '2',
                tags: [
                  { id: '3', name: 'VEGETARIAN', color: '#F59E0B', textColor: '#FFFFFF' },
                  { id: '5', name: 'CHEF SPECIAL', color: '#8B5CF6', textColor: '#FFFFFF' },
                ],
              },
            ],
          },
          {
            id: '3',
            name: 'Pasta',
            description: 'Handmade pasta dishes',
            sortOrder: 2,
            items: [
              {
                id: '7',
                name: 'Spaghetti Carbonara',
                description: 'Classic Roman pasta with eggs, pecorino cheese, guanciale, and black pepper',
                price: 15.99,
                isAvailable: true,
                isFeatured: true,
                isPopular: true,
                sortOrder: 0,
                categoryId: '3',
                tags: [
                  { id: '5', name: 'CHEF SPECIAL', color: '#8B5CF6', textColor: '#FFFFFF' },
                ],
              },
              {
                id: '8',
                name: 'Penne Arrabbiata',
                description: 'Penne pasta in a spicy tomato sauce with garlic and chili',
                price: 13.99,
                isAvailable: false,
                isFeatured: false,
                isPopular: false,
                sortOrder: 1,
                categoryId: '3',
                tags: [
                  { id: '4', name: 'SPICY', color: '#DC2626', textColor: '#FFFFFF' },
                  { id: '3', name: 'VEGAN', color: '#16A34A', textColor: '#FFFFFF' },
                ],
              },
              {
                id: '9',
                name: 'Lobster Ravioli',
                description: 'House-made ravioli filled with lobster in a saffron cream sauce',
                price: 24.99,
                comparePrice: 28.99,
                isAvailable: true,
                isFeatured: true,
                isPopular: true,
                sortOrder: 2,
                categoryId: '3',
                tags: [
                  { id: '5', name: 'CHEF SPECIAL', color: '#8B5CF6', textColor: '#FFFFFF' },
                ],
              },
            ],
          },
          {
            id: '4',
            name: 'Desserts',
            description: 'Sweet endings',
            sortOrder: 3,
            items: [
              {
                id: '10',
                name: 'Tiramisu',
                description: 'Classic Italian coffee-flavored dessert with mascarpone and cocoa',
                price: 7.99,
                isAvailable: true,
                isFeatured: true,
                isPopular: true,
                sortOrder: 0,
                categoryId: '4',
                tags: [
                  { id: '3', name: 'VEGETARIAN', color: '#F59E0B', textColor: '#FFFFFF' },
                ],
              },
              {
                id: '11',
                name: 'Panna Cotta',
                description: 'Silky vanilla custard with berry compote',
                price: 6.99,
                isAvailable: true,
                isFeatured: false,
                isPopular: false,
                sortOrder: 1,
                categoryId: '4',
                tags: [
                  { id: '3', name: 'GLUTEN_FREE', color: '#3730A3', textColor: '#FFFFFF' },
                ],
              },
            ],
          },
        ],
      };
      
      setMenuData(mockData);
      
      // Initialize expanded categories
      const categoryIds = new Set(mockData.categories.map(c => c.id));
      setExpandedCategories(categoryIds);
    } catch (err) {
      setError('Failed to load menu. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Initial fetch
  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  // Derived state
  const { restaurant, categories } = menuData || {};
  const primaryColor = restaurant?.primaryColor || DESIGN_TOKENS.primary;

  // Filtered items based on search and category
  const filteredData = useMemo(() => {
    if (!categories) return [];
    
    let filtered = categories;
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(cat => cat.id === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.map(cat => ({
        ...cat,
        items: cat.items.filter(item => 
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.tags?.some(tag => tag.name.toLowerCase().includes(query))
        ),
      })).filter(cat => cat.items.length > 0);
    }
    
    return filtered;
  }, [categories, activeCategory, searchQuery]);

  // Featured items for hero section
  const featuredItems = useMemo(() => {
    if (!categories) return [];
    return categories
      .flatMap(cat => cat.items)
      .filter(item => item.isFeatured)
      .slice(0, 3);
  }, [categories]);

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // Loading state
  if (loading) {
    return <MenuSkeleton />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={fetchMenuData} />;
  }

  // Not found state
  if (!restaurant || !categories) {
    return <RestaurantNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <header 
        className="sticky top-0 z-50 text-white shadow-lg"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Restaurant Name */}
            <h1 className="font-semibold text-lg sm:text-xl truncate pr-4">
              {restaurant.name}
            </h1>
            
            {/* Header Actions */}
            <div className="flex items-center gap-1">
              {/* Search Toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2.5 rounded-full hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={showSearch ? 'Close search' : 'Search menu'}
              >
                {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
              
              {/* Refresh */}
              <button
                onClick={fetchMenuData}
                className="p-2.5 rounded-full hover:bg-white/10 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Refresh menu"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Search Bar - Expandable */}
          <div className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            showSearch ? "max-h-20 pb-3" : "max-h-0"
          )}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <Input
                type="text"
                placeholder="Search dishes, ingredients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white/20 h-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Restaurant Info Section */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-5 sm:py-6">
          <div className="flex items-start gap-4">
            {/* Logo */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
              {restaurant.logo ? (
                <img 
                  src={restaurant.logo} 
                  alt={restaurant.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl sm:text-4xl">🍽️</span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{restaurant.name}</h2>
              {restaurant.description && (
                <p className="text-gray-600 text-sm sm:text-base mt-1 leading-relaxed">
                  {restaurant.description}
                </p>
              )}
              
              {/* Contact Info */}
              <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 text-sm text-gray-500">
                {restaurant.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate max-w-[180px] sm:max-w-[250px]">{restaurant.address}</span>
                  </div>
                )}
                {restaurant.phone && (
                  <a 
                    href={`tel:${restaurant.phone}`} 
                    className="flex items-center gap-1.5 hover:text-gray-700 transition-colors"
                  >
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{restaurant.phone}</span>
                    <span className="sm:hidden">Call</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Language Selector */}
          {restaurant.supportedLanguages.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-5">
              <span className="text-sm text-gray-500 flex items-center mr-1">
                <Globe className="w-4 h-4 mr-1" />
                Language:
              </span>
              {restaurant.supportedLanguages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm font-medium transition-all min-h-[36px]",
                    language === lang
                      ? 'text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                  style={{ backgroundColor: language === lang ? primaryColor : undefined }}
                >
                  {LANGUAGE_NAMES[lang] || lang.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Items Section */}
      {!searchQuery && activeCategory === 'all' && featuredItems.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Star className="w-5 h-5" style={{ color: primaryColor }} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Chef&apos;s Recommendations</h3>
              <p className="text-sm text-gray-500">Our most loved dishes</p>
            </div>
          </div>
          
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredItems.map((item) => (
              <FeaturedItemCard 
                key={item.id} 
                item={item} 
                primaryColor={primaryColor}
              />
            ))}
          </div>
        </section>
      )}

      {/* Category Filter Pills */}
      <section className="sticky top-14 sm:top-16 z-40 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setActiveCategory('all')}
              className={cn(
                "px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all min-h-[44px]",
                "border shadow-sm",
                activeCategory === 'all'
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              )}
              style={{ backgroundColor: activeCategory === 'all' ? primaryColor : undefined }}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  "px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all min-h-[44px]",
                  "border shadow-sm",
                  activeCategory === cat.id
                    ? 'text-white border-transparent'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                )}
                style={{ backgroundColor: activeCategory === cat.id ? primaryColor : undefined }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-4 text-sm text-gray-600">
            Showing results for &quot;<span className="font-medium">{searchQuery}</span>&quot;
            {' '}({filteredData.reduce((acc, cat) => acc + cat.items.length, 0)} items)
          </div>
        )}

        {/* Categories */}
        <div className="space-y-8">
          {filteredData.map((category) => (
            <section key={category.id} className="scroll-mt-32">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between mb-4 group"
              >
                <div className="text-left">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {category.items.length} items
                  </span>
                  {expandedCategories.has(category.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Items Grid */}
              {expandedCategories.has(category.id) && (
                <div className="space-y-3 sm:space-y-4">
                  {category.items.map((item) => (
                    <MenuItemCard 
                      key={item.id} 
                      item={item} 
                      primaryColor={primaryColor}
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No items found</h3>
            <p className="text-gray-500">
              {searchQuery 
                ? 'Try adjusting your search terms'
                : 'No items available in this category'
              }
            </p>
            {searchQuery && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto px-4 text-center">
          {restaurant.website && (
            <a 
              href={restaurant.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-3 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Visit our website
            </a>
          )}
          <p className="text-sm text-gray-400">
            Powered by <span className="font-semibold" style={{ color: primaryColor }}>DynamicMenu</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MenuPage;
