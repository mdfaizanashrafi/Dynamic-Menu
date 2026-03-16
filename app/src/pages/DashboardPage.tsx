/**
 * Dashboard Page
 * Main dashboard with upgrade banner and restaurant management
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Building2,
  Utensils,
  QrCode,
  TrendingUp,
  Crown,
  ArrowRight,
  Sparkles,
  Lock,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

// Restaurant type
interface Restaurant {
  id: string;
  name: string;
  slug: string;
  isPublished: boolean;
  menuCount: number;
  qrCodeCount: number;
  createdAt: string;
}

const DashboardPage: React.FC = () => {
  const { 
    user, 
    isFreeTier, 
    isProTier, 
    isEnterpriseTier, 
    canCreateRestaurant,
    restaurantCount,
    subscriptionLimits,
    logout,
  } = useAuth();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  // Fetch restaurants
  useEffect(() => {
    const fetchRestaurants = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_URL}/api/restaurants`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRestaurants(data);
        }
      } catch (error) {
        console.error('Failed to fetch restaurants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  // Get tier badge color
  const getTierBadgeVariant = () => {
    if (isFreeTier) return 'secondary';
    if (isProTier) return 'default';
    return 'destructive';
  };

  // Get restaurant usage percentage
  const getRestaurantUsagePercent = () => {
    if (subscriptionLimits.maxRestaurants === Infinity) return 0;
    return (restaurantCount / subscriptionLimits.maxRestaurants) * 100;
  };

  // Handle create restaurant click
  const handleCreateRestaurantClick = () => {
    if (!canCreateRestaurant) {
      setShowUpgradeDialog(true);
      return;
    }
    // Navigate to create restaurant page
    window.location.href = '/restaurants/new';
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">DynamicMenu</span>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={getTierBadgeVariant()} className="gap-1">
              <Crown className="w-3 h-3" />
              {user?.subscriptionTier}
            </Badge>
            <Button variant="ghost" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your restaurants and digital menus
          </p>
        </div>

        {/* Upgrade Banner for Free Users */}
        {isFreeTier && (
          <Alert className="mb-8 bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
            <Sparkles className="h-5 w-5 text-white" />
            <AlertTitle className="text-white font-semibold">
              Unlock More Restaurants
            </AlertTitle>
            <AlertDescription className="text-white/90 mt-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p>
                  You're currently on the Free plan with 1 restaurant. 
                  Upgrade to Pro for up to 5 restaurants and more features!
                </p>
                <Link to="/upgrade">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="bg-white text-orange-600 hover:bg-white/90 whitespace-nowrap"
                  >
                    Upgrade Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Pro Usage Warning */}
        {isProTier && restaurantCount >= 4 && (
          <Alert className="mb-8 border-amber-500 bg-amber-50">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-900">
              Approaching Restaurant Limit
            </AlertTitle>
            <AlertDescription className="text-amber-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p>
                  You've used {restaurantCount} of 5 restaurants on your Pro plan. 
                  Consider upgrading to Enterprise for unlimited restaurants.
                </p>
                <Link to="/upgrade">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-amber-500 text-amber-700 hover:bg-amber-100 whitespace-nowrap"
                  >
                    View Enterprise
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Restaurants
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{restaurantCount}</div>
              <p className="text-xs text-muted-foreground">
                {subscriptionLimits.maxRestaurants === Infinity
                  ? 'Unlimited allowed'
                  : `of ${subscriptionLimits.maxRestaurants} allowed`}
              </p>
              {subscriptionLimits.maxRestaurants !== Infinity && (
                <Progress 
                  value={getRestaurantUsagePercent()} 
                  className="mt-2 h-1"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Menus
              </CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {restaurants.reduce((acc, r) => acc + r.menuCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all restaurants
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                QR Codes
              </CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {restaurants.reduce((acc, r) => acc + r.qrCodeCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Generated codes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Restaurants Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Restaurants</h2>
            <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={handleCreateRestaurantClick}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Restaurant
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-orange-500" />
                    Upgrade Required
                  </DialogTitle>
                  <DialogDescription className="pt-4">
                    <p className="mb-4">
                      You've reached the limit of {subscriptionLimits.maxRestaurants} restaurant
                      {subscriptionLimits.maxRestaurants > 1 ? 's' : ''} on your{' '}
                      {user?.subscriptionTier} plan.
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p className="font-medium">Upgrade options:</p>
                      {isFreeTier && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Pro Plan - 5 restaurants</span>
                            <Link to="/upgrade?plan=pro">
                              <Button size="sm">Upgrade to Pro</Button>
                            </Link>
                          </div>
                        </>
                      )}
                      {(isFreeTier || isProTier) && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Enterprise - Unlimited</span>
                          <Link to="/upgrade?plan=enterprise">
                            <Button size="sm" variant="outline">
                              Contact Sales
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>

          {/* Restaurants Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Building2 className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No restaurants yet</h3>
                <p className="text-muted-foreground text-center max-w-sm mb-4">
                  Get started by creating your first restaurant and setting up your digital menu.
                </p>
                <Button
                  onClick={handleCreateRestaurantClick}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Restaurant
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <Link key={restaurant.id} to={`/restaurants/${restaurant.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-orange-600" />
                        </div>
                        <Badge variant={restaurant.isPublished ? 'default' : 'secondary'}>
                          {restaurant.isPublished ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{restaurant.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {restaurant.slug}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Utensils className="w-4 h-4" />
                          {restaurant.menuCount} menus
                        </div>
                        <div className="flex items-center gap-1">
                          <QrCode className="w-4 h-4" />
                          {restaurant.qrCodeCount} QR codes
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {/* Add Restaurant Card */}
              <Card
                onClick={handleCreateRestaurantClick}
                className={`border-dashed cursor-pointer h-full transition-all ${
                  canCreateRestaurant
                    ? 'hover:border-orange-500 hover:bg-orange-50/50'
                    : 'opacity-60 cursor-not-allowed'
                }`}
              >
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                    canCreateRestaurant ? 'bg-orange-100' : 'bg-gray-100'
                  }`}>
                    {canCreateRestaurant ? (
                      <Plus className="w-8 h-8 text-orange-600" />
                    ) : (
                      <Lock className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <h3 className="font-semibold mb-1">
                    {canCreateRestaurant ? 'Add Restaurant' : 'Limit Reached'}
                  </h3>
                  <p className="text-sm text-muted-foreground text-center px-4">
                    {canCreateRestaurant
                      ? 'Create a new restaurant'
                      : `Upgrade to add more restaurants`}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/menus">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Manage Menus</p>
                    <p className="text-xs text-muted-foreground">Edit items & categories</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/qr-codes">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">QR Codes</p>
                    <p className="text-xs text-muted-foreground">Generate & download</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/analytics">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Analytics</p>
                    <p className="text-xs text-muted-foreground">View insights</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/settings">
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Settings</p>
                    <p className="text-xs text-muted-foreground">Restaurant config</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
