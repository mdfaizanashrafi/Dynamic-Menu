/**
 * Auth Context
 * Manages authentication state and subscription tier
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// Subscription tier enum
export type SubscriptionTier = 'FREE' | 'PRO' | 'ENTERPRISE';

// User type with subscription info
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  subscriptionTier: SubscriptionTier;
  trialEndsAt?: string | null;
  createdAt?: string;
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  // Subscription helpers
  isFreeTier: boolean;
  isProTier: boolean;
  isEnterpriseTier: boolean;
  canCreateRestaurant: boolean;
  subscriptionLimits: {
    maxRestaurants: number;
    maxMenus: number;
    features: string[];
  };
  restaurantCount: number;
  refreshRestaurantCount: () => Promise<void>;
}

// Register data type
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Subscription limits configuration
const SUBSCRIPTION_LIMITS = {
  FREE: {
    maxRestaurants: 1,
    maxMenus: Infinity,
    features: [
      'Unlimited menu items',
      'Unlimited QR codes',
      'Basic analytics',
      'Custom branding',
    ],
  },
  PRO: {
    maxRestaurants: 5,
    maxMenus: Infinity,
    features: [
      'Up to 5 restaurants',
      'Unlimited menu items',
      'Unlimited QR codes',
      'Advanced analytics',
      'Custom branding',
      'Priority support',
      'API access',
    ],
  },
  ENTERPRISE: {
    maxRestaurants: Infinity,
    maxMenus: Infinity,
    features: [
      'Unlimited restaurants',
      'Unlimited menu items',
      'Unlimited QR codes',
      'Enterprise analytics',
      'Custom branding',
      '24/7 Priority support',
      'Full API access',
      'White-label option',
      'Dedicated account manager',
    ],
  },
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [restaurantCount, setRestaurantCount] = useState(0);

  // Check if user is on free tier
  const isFreeTier = user?.subscriptionTier === 'FREE';
  const isProTier = user?.subscriptionTier === 'PRO';
  const isEnterpriseTier = user?.subscriptionTier === 'ENTERPRISE';

  // Get subscription limits based on user's tier
  const subscriptionLimits = user
    ? SUBSCRIPTION_LIMITS[user.subscriptionTier]
    : SUBSCRIPTION_LIMITS.FREE;

  // Check if user can create more restaurants
  const canCreateRestaurant = user
    ? user.subscriptionTier === 'ENTERPRISE' ||
      (user.subscriptionTier === 'FREE' && restaurantCount === 0) ||
      (user.subscriptionTier === 'PRO' && restaurantCount < 5)
    : false;

  // Fetch restaurant count
  const fetchRestaurantCount = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/api/restaurants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const restaurants = await response.json();
        setRestaurantCount(restaurants.length);
      }
    } catch (error) {
      console.error('Failed to fetch restaurant count:', error);
    }
  };

  // Refresh restaurant count
  const refreshRestaurantCount = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchRestaurantCount(token);
    }
  };

  // Check auth status on mount
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        // Fetch restaurant count
        await fetchRestaurantCount(token);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setUser(data.user);
      await fetchRestaurantCount(data.token);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const result = await response.json();
      localStorage.setItem('token', result.token);
      setUser(result.user);
      setRestaurantCount(1); // Default restaurant created on registration
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    setRestaurantCount(0);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
    isFreeTier,
    isProTier,
    isEnterpriseTier,
    canCreateRestaurant,
    subscriptionLimits,
    restaurantCount,
    refreshRestaurantCount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
