/**
 * Interactive Demo Menu Page
 * Full customer menu experience for "Bella Vista Trattoria"
 * Showcases all DynamicMenu features for potential customers
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, Phone, Clock, Globe, Search, RefreshCw, 
  Star, Flame, Leaf, WheatOff, Info, ChefHat, 
  TrendingUp, AlertCircle, X, ChevronDown, ChevronUp,
  UtensilsCrossed, Heart, ShoppingBag, Sparkles,
  QrCode, ArrowLeft, Check, ChevronRight, Percent,
  DollarSign, Users, Zap
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

interface CartItem extends MenuItem {
  quantity: number;
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
  it: 'Italiano',
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
// Storage Helpers
// ============================================

const STORAGE_KEYS = {
  favorites: 'dynamicmenu_demo_favorites',
  cart: 'dynamicmenu_demo_cart',
  language: 'dynamicmenu_demo_language',
};

const getStoredFavorites = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || '[]');
  } catch {
    return [];
  }
};

const setStoredFavorites = (favorites: string[]) => {
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
};

const getStoredCart = (): CartItem[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
  } catch {
    return [];
  }
};

const setStoredCart = (cart: CartItem[]) => {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
};

// ============================================
// Components
// ============================================

/**
 * Tag Icon Component
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
  if (nameLower.includes('popular')) {
    return <TrendingUp className={className} />;
  }
  return <Star className={className} />;
};

/**
 * Dietary Tag Badge
 */
const DietaryTag = ({ tag }: { tag: Tag }) => {
  const style = getTagBadgeStyle(tag.name);
  
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105"
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
 * Benefits Banner
 */
const BenefitsBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="hidden sm:flex w-10 h-10 rounded-full bg-orange-500 items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm sm:text-base truncate">
                This could be YOUR restaurant menu!
              </p>
              <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                Join 1,000+ restaurants saving $500/month with DynamicMenu
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link to="/register">
              <Button 
                size="sm" 
                className="bg-orange-500 hover:bg-orange-600 text-white whitespace-nowrap"
              >
                <Zap className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Start Free Trial</span>
                <span className="sm:hidden">Start Free</span>
              </Button>
            </Link>
            <button 
              onClick={() => setIsVisible(false)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * QR Code Preview Modal
 */
const QRCodePreview = ({ 
  isOpen, 
  onClose, 
  restaurantName 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  restaurantName: string;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Scan to View Menu</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center py-6">
          <div className="w-48 h-48 bg-white rounded-2xl shadow-lg p-4 border-2 border-orange-100">
            {/* Simulated QR Code */}
            <div className="w-full h-full bg-gray-900 rounded-xl flex items-center justify-center relative overflow-hidden">
              <QrCode className="w-32 h-32 text-white" />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent" />
            </div>
          </div>
          <p className="mt-4 text-center text-gray-600">
            Customers scan this code to instantly view your digital menu
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-orange-600">
            <Check className="w-4 h-4" />
            <span>No app download required</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Item Detail Modal
 */
const ItemDetailModal = ({
  item,
  isOpen,
  onClose,
  primaryColor,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
}: {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  primaryColor: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onAddToCart: () => void;
}) => {
  if (!item) return null;

  const hasDiscount = item.comparePrice && item.comparePrice > item.price;
  const discountPercent = hasDiscount 
    ? Math.round(((item.comparePrice! - item.price) / item.comparePrice!) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Image */}
        <div className="relative -mx-6 -mt-6 mb-4 aspect-video">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <UtensilsCrossed className="w-16 h-16 text-gray-300" />
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {item.isPopular && (
              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                <Flame className="w-3 h-3 mr-1" />
                Popular
              </Badge>
            )}
            {item.isFeatured && !item.isPopular && (
              <Badge style={{ backgroundColor: primaryColor }} className="text-white">
                <ChefHat className="w-3 h-3 mr-1" />
                Chef's Special
              </Badge>
            )}
          </div>

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-full">
              Save {discountPercent}%
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={onToggleFavorite}
            className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center transition-transform hover:scale-110"
          >
            <Heart 
              className={cn(
                "w-5 h-5 transition-colors",
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
              )} 
            />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="flex justify-between items-start gap-4">
            <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
            <div className="text-right">
              <span 
                className="block text-2xl font-bold"
                style={{ color: primaryColor }}
              >
                {formatPrice(item.price)}
              </span>
              {hasDiscount && (
                <span className="text-gray-400 line-through">
                  {formatPrice(item.comparePrice!)}
                </span>
              )}
            </div>
          </div>

          {item.description && (
            <p className="text-gray-600 leading-relaxed">{item.description}</p>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <DietaryTag key={tag.id} tag={tag} />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex gap-3">
            <Button
              onClick={onAddToCart}
              className="flex-1 h-12 text-base"
              style={{ backgroundColor: primaryColor }}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Add to My Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Cart Drawer
 */
const CartDrawer = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  primaryColor,
}: {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  primaryColor: string;
}) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            My Order ({itemCount} items)
          </DialogTitle>
        </DialogHeader>

        {cart.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">Your order is empty</p>
            <p className="text-sm text-gray-400 mt-1">Add items to get started</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.name}</h4>
                    <p className="text-sm" style={{ color: primaryColor }}>
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full bg-white border flex items-center justify-center hover:bg-gray-100"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full bg-white border flex items-center justify-center hover:bg-gray-100"
                      >
                        +
                      </button>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="ml-auto text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span style={{ color: primaryColor }}>{formatPrice(total)}</span>
              </div>
              <Button 
                className="w-full h-12"
                style={{ backgroundColor: primaryColor }}
                onClick={() => {
                  toast.success('This is a demo - orders are simulated!');
                }}
              >
                Place Order (Demo)
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Savings Calculator
 */
const SavingsCalculator = () => {
  const [monthlyPrints, setMonthlyPrints] = useState(50);
  const printCost = 2.5;
  const monthlySavings = monthlyPrints * printCost;
  const yearlySavings = monthlySavings * 12;

  return (
    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">See Your Savings</h3>
          <p className="text-sm text-gray-600">Calculate printing cost savings</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-600 mb-2 block">
            Menu reprints per month: <span className="font-bold">{monthlyPrints}</span>
          </label>
          <input
            type="range"
            min="0"
            max="200"
            value={monthlyPrints}
            onChange={(e) => setMonthlyPrints(Number(e.target.value))}
            className="w-full h-2 bg-orange-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">Monthly Savings</p>
            <p className="text-2xl font-bold text-orange-600">${monthlySavings}</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <p className="text-sm text-gray-500">Yearly Savings</p>
            <p className="text-2xl font-bold text-green-600">${yearlySavings}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Stats Section
 */
const StatsSection = () => {
  const stats = [
    { icon: Users, value: '1,000+', label: 'Restaurants' },
    { icon: DollarSign, value: '$500', label: 'Avg Monthly Savings' },
    { icon: Percent, value: '85%', label: 'Less Printing' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 py-4">
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-orange-100 flex items-center justify-center">
            <stat.icon className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-lg font-bold text-gray-900">{stat.value}</p>
          <p className="text-xs text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

/**
 * Menu Item Card
 */
const MenuItemCard = ({ 
  item, 
  primaryColor,
  isFavorite,
  onToggleFavorite,
  onClick,
  onAddToCart,
}: { 
  item: MenuItem; 
  primaryColor: string;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onClick: () => void;
  onAddToCart: (e: React.MouseEvent) => void;
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
        "active:scale-[0.99] cursor-pointer",
        !item.isAvailable && "opacity-60 grayscale"
      )}
      onClick={onClick}
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

        {/* Favorite Button */}
        <button
          onClick={onToggleFavorite}
          className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart 
            className={cn(
              "w-3.5 h-3.5 transition-colors",
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
            )} 
          />
        </button>
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
          
          {/* Price Section */}
          <div className="text-right flex-shrink-0 pl-2">
            <span 
              className="block font-bold text-lg sm:text-xl"
              style={{ color: primaryColor }}
            >
              {formatPrice(item.price)}
            </span>
            {hasDiscount && (
              <span className="block text-sm text-gray-400 line-through">
                {formatPrice(item.comparePrice!)}
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

        {/* Actions */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          {!item.isAvailable ? (
            <div className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
              <Info className="w-4 h-4" />
              Currently unavailable
            </div>
          ) : (
            <>
              <span className="text-xs text-gray-400">Tap for details</span>
              <Button
                size="sm"
                variant="outline"
                onClick={onAddToCart}
                className="h-8 text-xs"
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Featured Item Card
 */
const FeaturedItemCard = ({ 
  item, 
  primaryColor,
  onClick,
}: { 
  item: MenuItem; 
  primaryColor: string;
  onClick: () => void;
}) => {
  return (
    <div 
      className={cn(
        "group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden",
        "transition-all duration-200 ease-out",
        "hover:shadow-lg hover:border-gray-200 cursor-pointer"
      )}
      onClick={onClick}
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
            Save {formatPrice(item.comparePrice - item.price)}
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
              {formatPrice(item.price)}
            </span>
            {item.comparePrice && (
              <span className="block text-sm text-gray-400 line-through">
                {formatPrice(item.comparePrice)}
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
 * Loading Skeleton
 */
const MenuSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="h-16 bg-gray-200 animate-pulse" />
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
    <div className="px-4 py-4">
      <div className="flex gap-2 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
        ))}
      </div>
    </div>
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
 * Error State
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

// ============================================
// Main Demo Menu Page
// ============================================

const DemoMenuPage = () => {
  // State
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [language, setLanguage] = useState<string>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [showDemoPanel, setShowDemoPanel] = useState(true);

  // Load stored data
  useEffect(() => {
    setFavorites(getStoredFavorites());
    setCart(getStoredCart());
    const storedLang = localStorage.getItem(STORAGE_KEYS.language);
    if (storedLang) setLanguage(storedLang);
  }, []);

  // Save favorites to storage
  useEffect(() => {
    setStoredFavorites(favorites);
  }, [favorites]);

  // Save cart to storage
  useEffect(() => {
    setStoredCart(cart);
  }, [cart]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.language, language);
  }, [language]);

  // Fetch demo menu data
  const fetchMenuData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to fetch from API first
      const response = await fetch('/api/public/demo');
      
      if (response.ok) {
        const result = await response.json();
        setMenuData(result.data);
      } else {
        // Fall back to mock data if API fails
        throw new Error('API unavailable');
      }
    } catch (err) {
      // Use embedded mock data as fallback
      const mockData: MenuData = {
        restaurant: {
          id: 'demo-restaurant',
          name: 'Bella Vista Trattoria',
          slug: 'bella-vista-trattoria',
          description: 'Authentic Italian cuisine with a modern twist. Experience the flavors of Italy in a warm, inviting atmosphere with breathtaking views.',
          logo: '',
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
            sortOrder: 0,
            items: [
              {
                id: 'item-1',
                name: 'Bruschetta al Pomodoro',
                description: 'Grilled artisan bread topped with fresh tomatoes, garlic, basil, and extra virgin olive oil.',
                price: 9.99,
                image: 'https://images.unsplash.com/photo-1572695157363-bc31c5b0a89a?w=400&q=80',
                isAvailable: true,
                isFeatured: false,
                isPopular: true,
                sortOrder: 0,
                categoryId: 'cat-1',
                tags: [{ id: 'tag-1', name: 'VEGAN', color: '#16A34A', textColor: '#FFFFFF' }],
              },
              {
                id: 'item-2',
                name: 'Carpaccio di Manzo',
                description: 'Thinly sliced raw beef tenderloin with arugula, parmesan shavings, and lemon olive oil dressing.',
                price: 16.99,
                image: 'https://images.unsplash.com/photo-1546272989-40c92939c6c3?w=400&q=80',
                isAvailable: true,
                isFeatured: true,
                isPopular: false,
                sortOrder: 1,
                categoryId: 'cat-1',
                tags: [
                  { id: 'tag-4', name: 'GLUTEN_FREE', color: '#3730A3', textColor: '#FFFFFF' },
                  { id: 'tag-6', name: "CHEF'S SPECIAL", color: '#7C3AED', textColor: '#FFFFFF' },
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
                categoryId: 'cat-1',
                tags: [{ id: 'tag-5', name: 'POPULAR', color: '#FF6B35', textColor: '#FFFFFF' }],
              },
            ],
          },
          {
            id: 'cat-2',
            name: 'Pizza',
            description: 'Wood-fired Neapolitan pizzas with the finest ingredients',
            sortOrder: 1,
            items: [
              {
                id: 'item-4',
                name: 'Margherita D.O.C.',
                description: 'San Marzano tomato sauce, fresh buffalo mozzarella D.O.C., fresh basil, and extra virgin olive oil.',
                price: 15.99,
                image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
                isAvailable: true,
                isFeatured: true,
                isPopular: true,
                sortOrder: 0,
                categoryId: 'cat-2',
                tags: [
                  { id: 'tag-2', name: 'VEGETARIAN', color: '#F59E0B', textColor: '#FFFFFF' },
                  { id: 'tag-5', name: 'POPULAR', color: '#FF6B35', textColor: '#FFFFFF' },
                ],
              },
              {
                id: 'item-5',
                name: 'Diavola',
                description: 'Spicy salami, mozzarella, San Marzano tomato sauce, and chili flakes for a fiery kick.',
                price: 18.99,
                image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80',
                isAvailable: true,
                isFeatured: false,
                isPopular: true,
                sortOrder: 1,
                categoryId: 'cat-2',
                tags: [{ id: 'tag-3', name: 'SPICY', color: '#DC2626', textColor: '#FFFFFF' }],
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
                categoryId: 'cat-2',
                tags: [{ id: 'tag-5', name: 'POPULAR', color: '#FF6B35', textColor: '#FFFFFF' }],
              },
            ],
          },
          {
            id: 'cat-3',
            name: 'Pasta',
            description: 'Fresh handmade pasta prepared daily by our master chefs',
            sortOrder: 2,
            items: [
              {
                id: 'item-7',
                name: 'Spaghetti alla Carbonara',
                description: 'Classic Roman pasta with eggs, pecorino Romano, guanciale, and freshly cracked black pepper.',
                price: 18.99,
                image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80',
                isAvailable: true,
                isFeatured: true,
                isPopular: true,
                sortOrder: 0,
                categoryId: 'cat-3',
                tags: [{ id: 'tag-5', name: 'POPULAR', color: '#FF6B35', textColor: '#FFFFFF' }],
              },
              {
                id: 'item-8',
                name: 'Ravioli di Aragosta',
                description: 'House-made lobster ravioli in a delicate saffron cream sauce with fresh herbs.',
                price: 28.99,
                image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=80',
                isAvailable: true,
                isFeatured: true,
                isPopular: true,
                sortOrder: 1,
                categoryId: 'cat-3',
                tags: [
                  { id: 'tag-6', name: "CHEF'S SPECIAL", color: '#7C3AED', textColor: '#FFFFFF' },
                  { id: 'tag-5', name: 'POPULAR', color: '#FF6B35', textColor: '#FFFFFF' },
                ],
              },
              {
                id: 'item-9',
                name: 'Penne all\'Arrabbiata',
                description: 'Penne pasta in a spicy tomato sauce with garlic, chili flakes, and fresh parsley.',
                price: 16.99,
                image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=400&q=80',
                isAvailable: true,
                isFeatured: false,
                isPopular: false,
                sortOrder: 2,
                categoryId: 'cat-3',
                tags: [
                  { id: 'tag-3', name: 'SPICY', color: '#DC2626', textColor: '#FFFFFF' },
                  { id: 'tag-1', name: 'VEGAN', color: '#16A34A', textColor: '#FFFFFF' },
                ],
              },
            ],
          },
          {
            id: 'cat-4',
            name: 'Desserts',
            description: 'Sweet Italian classics to end your meal perfectly',
            sortOrder: 3,
            items: [
              {
                id: 'item-10',
                name: 'Tiramisu Classico',
                description: 'Layers of espresso-soaked ladyfingers and mascarpone cream, dusted with cocoa powder.',
                price: 9.99,
                image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80',
                isAvailable: true,
                isFeatured: true,
                isPopular: true,
                sortOrder: 0,
                categoryId: 'cat-4',
                tags: [
                  { id: 'tag-2', name: 'VEGETARIAN', color: '#F59E0B', textColor: '#FFFFFF' },
                  { id: 'tag-5', name: 'POPULAR', color: '#FF6B35', textColor: '#FFFFFF' },
                ],
              },
              {
                id: 'item-11',
                name: 'Panna Cotta',
                description: 'Silky vanilla bean custard with wild berry compote and fresh mint.',
                price: 8.99,
                image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
                isAvailable: true,
                isFeatured: false,
                isPopular: false,
                sortOrder: 1,
                categoryId: 'cat-4',
                tags: [
                  { id: 'tag-4', name: 'GLUTEN_FREE', color: '#3730A3', textColor: '#FFFFFF' },
                  { id: 'tag-2', name: 'VEGETARIAN', color: '#F59E0B', textColor: '#FFFFFF' },
                ],
              },
            ],
          },
          {
            id: 'cat-5',
            name: 'Drinks',
            description: 'Refreshing beverages, Italian wines, and signature cocktails',
            sortOrder: 4,
            items: [
              {
                id: 'item-12',
                name: 'Aperol Spritz',
                description: 'Aperol, prosecco, and soda water with a slice of orange. The perfect Italian aperitif.',
                price: 12.99,
                image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=80',
                isAvailable: true,
                isFeatured: true,
                isPopular: true,
                sortOrder: 0,
                categoryId: 'cat-5',
                tags: [{ id: 'tag-5', name: 'POPULAR', color: '#FF6B35', textColor: '#FFFFFF' }],
              },
              {
                id: 'item-13',
                name: 'Limonata Fresca',
                description: 'Freshly squeezed lemonade with mint and a hint of sparkling water.',
                price: 5.99,
                image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80',
                isAvailable: true,
                isFeatured: false,
                isPopular: true,
                sortOrder: 1,
                categoryId: 'cat-5',
                tags: [{ id: 'tag-1', name: 'VEGAN', color: '#16A34A', textColor: '#FFFFFF' }],
              },
            ],
          },
        ],
      };
      
      setMenuData(mockData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  // Initialize expanded categories
  useEffect(() => {
    if (menuData?.categories) {
      const categoryIds = new Set(menuData.categories.map(c => c.id));
      setExpandedCategories(categoryIds);
    }
  }, [menuData]);

  // Derived state
  const { restaurant, categories } = menuData || {};
  const primaryColor = restaurant?.primaryColor || DESIGN_TOKENS.primary;

  // Filtered items based on search and category
  const filteredData = useMemo(() => {
    if (!categories) return [];
    
    let filtered = categories;
    
    if (activeCategory !== 'all') {
      filtered = filtered.filter(cat => cat.id === activeCategory);
    }
    
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

  // Featured items
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

  // Toggle favorite
  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => {
      if (prev.includes(itemId)) {
        toast.success('Removed from favorites');
        return prev.filter(id => id !== itemId);
      } else {
        toast.success('Added to favorites!');
        return [...prev, itemId];
      }
    });
  };

  // Add to cart
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast.success(`${item.name} added to order!`);
  };

  // Update cart quantity
  const updateCartQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(i => i.id !== itemId));
    } else {
      setCart(prev => prev.map(i => 
        i.id === itemId ? { ...i, quantity } : i
      ));
    }
  };

  // Remove from cart
  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.id !== itemId));
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
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Demo Menu Not Available</h1>
          <Link to="/" className="text-orange-500 hover:underline mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header Banner */}
      <div className="bg-gray-900 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">Interactive Demo Menu - Experience what your customers will see</span>
            <span className="sm:hidden">Demo Menu</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white h-7 text-xs">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky Menu Header */}
      <header 
        className="sticky top-0 z-40 text-white shadow-lg"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <h1 className="font-semibold text-lg sm:text-xl truncate pr-4">
              {restaurant.name}
            </h1>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label={showSearch ? 'Close search' : 'Search menu'}
              >
                {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setIsQRCodeOpen(true)}
                className="p-2.5 rounded-full hover:bg-white/10 transition-colors hidden sm:flex"
                aria-label="Show QR code"
              >
                <QrCode className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsCartOpen(true)}
                className="p-2.5 rounded-full hover:bg-white/10 transition-colors relative"
                aria-label="View cart"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-5 h-5 bg-white text-orange-600 text-xs font-bold rounded-full flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out",
            showSearch ? "max-h-20 pb-3" : "max-h-0"
          )}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <Input
                type="text"
                placeholder="Search dishes, ingredients, tags..."
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

      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8">
          {/* Restaurant Info Section */}
          <section className="bg-white border-b border-gray-200">
            <div className="px-4 py-5 sm:py-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                  <UtensilsCrossed className="w-8 h-8 sm:w-10 sm:h-10 text-orange-500" />
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{restaurant.name}</h2>
                  {restaurant.description && (
                    <p className="text-gray-600 text-sm sm:text-base mt-1 leading-relaxed">
                      {restaurant.description}
                    </p>
                  )}
                  
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

          {/* Stats Section */}
          <section className="px-4">
            <StatsSection />
          </section>

          {/* Featured Items Section */}
          {!searchQuery && activeCategory === 'all' && featuredItems.length > 0 && (
            <section className="px-4 py-6 sm:py-8">
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
              
              <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
                {featuredItems.map((item) => (
                  <FeaturedItemCard 
                    key={item.id} 
                    item={item} 
                    primaryColor={primaryColor}
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Category Filter Pills */}
          <section className="sticky top-14 sm:top-16 z-30 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200">
            <div className="px-4 py-3">
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
          <main className="px-4 py-6 pb-32">
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

                  {expandedCategories.has(category.id) && (
                    <div className="space-y-3 sm:space-y-4">
                      {category.items.map((item) => (
                        <MenuItemCard 
                          key={item.id} 
                          item={item} 
                          primaryColor={primaryColor}
                          isFavorite={favorites.includes(item.id)}
                          onToggleFavorite={(e) => {
                            e.stopPropagation();
                            toggleFavorite(item.id);
                          }}
                          onClick={() => setSelectedItem(item)}
                          onAddToCart={(e) => {
                            e.stopPropagation();
                            addToCart(item);
                          }}
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
        </div>

        {/* Sidebar - Demo Panel */}
        <aside className={cn(
          "lg:col-span-4",
          "lg:sticky lg:top-20 lg:self-start",
          "fixed inset-x-0 bottom-0 z-40 lg:relative",
          "transition-transform duration-300",
          showDemoPanel ? "translate-y-0" : "translate-y-[calc(100%-3rem)] lg:translate-y-0"
        )}>
          {/* Mobile Toggle */}
          <button
            onClick={() => setShowDemoPanel(!showDemoPanel)}
            className="lg:hidden absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-2 rounded-t-xl text-sm font-medium flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Demo Features
            <ChevronUp className={cn("w-4 h-4 transition-transform", showDemoPanel && "rotate-180")} />
          </button>

          <div className="bg-white lg:bg-transparent p-4 lg:p-0 space-y-4 lg:space-y-6 max-h-[70vh] lg:max-h-none overflow-y-auto lg:overflow-visible pb-24 lg:pb-0">
            {/* QR Code Preview Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">QR Code Menu</h3>
                  <p className="text-sm text-gray-500">Customers scan to view instantly</p>
                </div>
              </div>
              <div 
                className="w-32 h-32 mx-auto bg-gray-900 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setIsQRCodeOpen(true)}
              >
                <QrCode className="w-20 h-20 text-white" />
              </div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => setIsQRCodeOpen(true)}
              >
                Preview QR Code
              </Button>
            </div>

            {/* Savings Calculator */}
            <SavingsCalculator />

            {/* Demo Features List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Features You Get
              </h3>
              <ul className="space-y-3">
                {[
                  'Unlimited QR codes for tables',
                  'Real-time menu updates',
                  'Multi-language support',
                  'Dietary tags & filtering',
                  'Analytics & insights',
                  'Custom branding & colors',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button 
                  className="w-full mt-4 h-12"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Start Free Trial
                </Button>
              </Link>
            </div>

            {/* Favorites Summary */}
            {favorites.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500" />
                  Your Favorites
                </h3>
                <p className="text-sm text-gray-500">
                  {favorites.length} item{favorites.length !== 1 ? 's' : ''} saved
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  (Stored locally in your browser)
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            Demo menu powered by <span className="font-semibold" style={{ color: primaryColor }}>DynamicMenu</span>
          </p>
          <div className="flex justify-center gap-4 mt-3">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              Home
            </Link>
            <Link to="/login" className="text-sm text-gray-500 hover:text-gray-700">
              Sign In
            </Link>
            <Link to="/register" className="text-sm text-gray-500 hover:text-gray-700">
              Get Started
            </Link>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        primaryColor={primaryColor}
        isFavorite={selectedItem ? favorites.includes(selectedItem.id) : false}
        onToggleFavorite={() => selectedItem && toggleFavorite(selectedItem.id)}
        onAddToCart={() => {
          if (selectedItem) {
            addToCart(selectedItem);
            setSelectedItem(null);
          }
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        primaryColor={primaryColor}
      />

      <QRCodePreview
        isOpen={isQRCodeOpen}
        onClose={() => setIsQRCodeOpen(false)}
        restaurantName={restaurant.name}
      />

      {/* Benefits Banner */}
      <div className="hidden lg:block">
        <BenefitsBanner />
      </div>
    </div>
  );
};

export default DemoMenuPage;
