/**
 * Simulated Dashboard Component
 * Mock dashboard UI for the product tour - visual only, not functional
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Utensils, QrCode, BarChart3, Settings,
  Plus, MoreVertical, Eye, Download, Copy,
  TrendingUp, Users, Clock, Image as ImageIcon, Flame,
  Check, CheckCircle2, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// ============================================
// Types
// ============================================

export interface SimulatedDashboardProps {
  activeStep?: string;
  className?: string;
}

export interface MockMenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
  isPopular: boolean;
  views: number;
  orders: number;
}

export interface MockQRCodes {
  id: string;
  name: string;
  type: string;
  scans: number;
}

// ============================================
// Mock Data
// ============================================

const mockStats = [
  { label: 'Total Views', value: '2,847', change: '+12%', icon: Eye, color: 'bg-blue-100 text-blue-700' },
  { label: 'Unique Visitors', value: '1,234', change: '+8%', icon: Users, color: 'bg-green-100 text-green-700' },
  { label: 'Avg. Session', value: '3m 24s', change: '+15%', icon: Clock, color: 'bg-purple-100 text-purple-700' },
  { label: 'QR Scans', value: '892', change: '+23%', icon: QrCode, color: 'bg-orange-100 text-orange-700' },
];

const mockCategories = [
  { id: '1', name: 'Starters', itemCount: 4 },
  { id: '2', name: 'Pizza', itemCount: 8 },
  { id: '3', name: 'Pasta', itemCount: 6 },
  { id: '4', name: 'Desserts', itemCount: 3 },
];

const initialMenuItems: MockMenuItem[] = [
  { id: '1', name: 'Bruschetta', price: 8.99, category: 'Starters', isAvailable: true, isPopular: true, views: 298, orders: 45 },
  { id: '2', name: 'Margherita Pizza', price: 14.99, category: 'Pizza', isAvailable: true, isPopular: true, views: 456, orders: 89 },
  { id: '3', name: 'Spaghetti Carbonara', price: 15.99, category: 'Pasta', isAvailable: true, isPopular: false, views: 389, orders: 67 },
  { id: '4', name: 'Tiramisu', price: 7.99, category: 'Desserts', isAvailable: true, isPopular: true, views: 312, orders: 54 },
];

const mockQRCodes: MockQRCodes[] = [
  { id: '1', name: 'Table 1', type: 'TABLE', scans: 234 },
  { id: '2', name: 'Table 2', type: 'TABLE', scans: 189 },
  { id: '3', name: 'Bar Counter', type: 'BAR', scans: 456 },
  { id: '4', name: 'Takeaway', type: 'TAKEAWAY', scans: 123 },
];

// ============================================
// Sidebar Component
// ============================================

const SimulatedSidebar: React.FC<{ activeStep?: string }> = ({ activeStep }) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', id: 'dashboard', tourTarget: 'dashboard-stats' },
    { icon: Utensils, label: 'Menu Builder', id: 'menu', tourTarget: 'menu-builder' },
    { icon: QrCode, label: 'QR Codes', id: 'qr', tourTarget: 'qr-codes' },
    { icon: BarChart3, label: 'Analytics', id: 'analytics', tourTarget: 'analytics' },
    { icon: Settings, label: 'Settings', id: 'settings', tourTarget: null },
  ];

  const [activeNav, setActiveNav] = useState('dashboard');

  // Auto-navigate based on tour step
  useEffect(() => {
    if (activeStep === 'dashboard') setActiveNav('dashboard');
    if (activeStep === 'menu-builder') setActiveNav('menu');
    if (activeStep === 'qr-codes') setActiveNav('qr');
    if (activeStep === 'realtime') setActiveNav('menu');
    if (activeStep === 'analytics') setActiveNav('analytics');
  }, [activeStep]);

  return (
    <aside className="w-56 bg-white border-r border-gray-200 min-h-full flex-shrink-0">
      {/* Logo */}
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <QrCode className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">DynamicMenu</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            data-tour={item.tourTarget}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
              activeNav === item.id
                ? 'bg-orange-50 text-orange-600'
                : 'text-gray-600 hover:bg-gray-50'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-200 bg-white w-56">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center">
            <span className="text-white font-medium text-sm">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-sm truncate">John Doe</p>
            <p className="text-xs text-gray-500 truncate">john@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

// ============================================
// Dashboard Stats View
// ============================================

const DashboardStatsView: React.FC<{ activeStep?: string }> = ({ activeStep }) => {
  return (
    <div className="space-y-6" data-tour="welcome">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back! Here's what's happening with your menu.</p>
        </div>
        <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {/* Stats Grid */}
      <div 
        className={cn(
          "grid grid-cols-2 gap-3 transition-all duration-500",
          activeStep === 'dashboard' && "scale-[1.02]"
        )}
        data-tour="dashboard-stats"
      >
        {mockStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                  <p className="text-lg font-bold text-gray-900 mt-0.5">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">{stat.change}</span>
                  </div>
                </div>
                <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Popular Items */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <CardTitle className="text-sm">Popular Items</CardTitle>
            <Button variant="ghost" size="sm" className="text-orange-600 text-xs h-8">
              View All
            </Button>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {initialMenuItems.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{item.views} views</span>
                      <span>{item.orders} orders</span>
                    </div>
                  </div>
                  {item.isPopular && (
                    <Badge className="bg-orange-100 text-orange-700 text-xs">
                      <Flame className="w-3 h-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start text-xs h-9">
              <Plus className="w-3 h-3 mr-2" />
              Add Category
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs h-9">
              <QrCode className="w-3 h-3 mr-2" />
              Generate QR
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs h-9">
              <Download className="w-3 h-3 mr-2" />
              Export Menu
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-xs h-9">
              <Eye className="w-3 h-3 mr-2" />
              Preview
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ============================================
// Menu Builder View
// ============================================

const MenuBuilderView: React.FC<{ activeStep?: string }> = ({ activeStep }) => {
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [showPulse, setShowPulse] = useState(false);

  // Simulate interaction when tour reaches this step
  useEffect(() => {
    if (activeStep === 'menu-builder') {
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 2000);
    }
  }, [activeStep]);

  const toggleAvailability = (id: string) => {
    setMenuItems(items =>
      items.map(item =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Menu Builder</h1>
          <p className="text-sm text-gray-600">Manage your categories and menu items</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Category
          </Button>
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Item
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {mockCategories.map((cat, i) => (
          <button
            key={cat.id}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors",
              i === 0 
                ? 'bg-orange-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {cat.name}
          </button>
        ))}
        <button className="px-3 py-1.5 rounded-lg text-sm bg-gray-50 text-gray-400 border border-dashed border-gray-300">
          + Add
        </button>
      </div>

      {/* Items List */}
      <div 
        className={cn(
          "space-y-2 transition-all duration-500",
          showPulse && "scale-[1.01]"
        )}
        data-tour="menu-builder"
      >
        {menuItems.map((item) => (
          <div 
            key={item.id} 
            className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  {item.isPopular && (
                    <Badge className="bg-orange-100 text-orange-700 text-xs">
                      <Flame className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{item.category} • ${item.price}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div 
                className="flex items-center gap-2"
                data-tour={item.id === '2' ? 'realtime-toggle' : undefined}
              >
                <span className={cn(
                  "text-xs transition-colors",
                  item.isAvailable ? 'text-green-600' : 'text-gray-400'
                )}>
                  {item.isAvailable ? 'Available' : 'Sold Out'}
                </span>
                <Switch
                  checked={item.isAvailable}
                  onCheckedChange={() => toggleAvailability(item.id)}
                  className={cn(
                    activeStep === 'realtime' && item.id === '2' && "ring-2 ring-orange-500 ring-offset-2"
                  )}
                />
              </div>
              <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Item Placeholder */}
      <button className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-colors flex flex-col items-center gap-2">
        <Plus className="w-6 h-6 text-gray-400" />
        <span className="text-sm text-gray-600 font-medium">Add New Menu Item</span>
      </button>
    </div>
  );
};

// ============================================
// QR Codes View
// ============================================

const QRCodesView: React.FC<{ activeStep?: string }> = ({ activeStep }) => {
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);

  // Simulate QR generation when tour reaches this step
  useEffect(() => {
    if (activeStep === 'qr-codes') {
      const timer = setTimeout(() => {
        setGeneratedQR('new-table-5');
        setTimeout(() => setGeneratedQR(null), 2000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [activeStep]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">QR Codes</h1>
          <p className="text-sm text-gray-600">Generate and manage QR codes</p>
        </div>
        <Button 
          size="sm" 
          className={cn(
            "bg-orange-500 hover:bg-orange-600 text-white transition-all",
            generatedQR && "scale-105"
          )}
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate QR
        </Button>
      </div>

      {/* QR Codes Grid */}
      <div 
        className="grid grid-cols-2 gap-3"
        data-tour="qr-codes"
      >
        {mockQRCodes.map((qr) => (
          <Card key={qr.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 text-sm">{qr.name}</h3>
                  <p className="text-xs text-gray-500">{qr.scans} scans</p>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded text-gray-400">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <QrCode className="w-16 h-16 text-gray-800" />
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                  <Download className="w-3 h-3 mr-1" />
                  PNG
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-xs h-8">
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Add QR Card */}
        <Card 
          className={cn(
            "border-dashed border-2 transition-all cursor-pointer",
            generatedQR 
              ? "border-orange-500 bg-orange-50" 
              : "hover:border-orange-300 hover:bg-orange-50 border-gray-200"
          )}
        >
          <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[180px]">
            {generatedQR ? (
              <div className="text-center animate-in zoom-in">
                <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-900">QR Generated!</p>
              </div>
            ) : (
              <>
                <Plus className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 font-medium">New QR Code</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ============================================
// Analytics View
// ============================================

const AnalyticsView: React.FC<{ activeStep?: string }> = () => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-600">Track menu performance and engagement</p>
      </div>

      {/* Analytics Content */}
      <div className="grid grid-cols-3 gap-4">
        {/* Chart */}
        <Card 
          className="col-span-2"
          data-tour="analytics"
        >
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Menu Views</CardTitle>
              <div className="flex items-center gap-2">
                <button className="text-xs text-gray-500 flex items-center gap-1 hover:text-gray-700">
                  Last 7 days
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-end justify-between gap-1">
              {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-t transition-all duration-500 hover:opacity-80",
                    i === 5 ? "bg-orange-500" : "bg-orange-200"
                  )}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-3 text-xs text-gray-500">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </CardContent>
        </Card>

        {/* Device Stats */}
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Devices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: 'Mobile', value: 68, color: 'bg-orange-500' },
              { label: 'Desktop', value: 24, color: 'bg-blue-500' },
              { label: 'Tablet', value: 8, color: 'bg-green-500' },
            ].map((device) => (
              <div key={device.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{device.label}</span>
                  <span className="font-medium">{device.value}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${device.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${device.value}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Popular Times */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-sm">Popular Times</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>12 PM</span>
                <span>6 PM</span>
                <span>10 PM</span>
              </div>
              <div className="h-8 bg-gradient-to-r from-orange-100 via-orange-300 to-orange-100 rounded-lg" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">7 PM</p>
              <p className="text-xs text-gray-500">Peak hour</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ============================================
// Main Simulated Dashboard Component
// ============================================

export const SimulatedDashboard: React.FC<SimulatedDashboardProps> = ({
  activeStep,
  className,
}) => {
  const [currentView, setCurrentView] = useState('dashboard');

  // Auto-switch views based on tour step
  useEffect(() => {
    if (activeStep === 'welcome' || activeStep === 'dashboard') {
      setCurrentView('dashboard');
    } else if (activeStep === 'menu-builder' || activeStep === 'realtime') {
      setCurrentView('menu');
    } else if (activeStep === 'qr-codes') {
      setCurrentView('qr');
    } else if (activeStep === 'analytics') {
      setCurrentView('analytics');
    }
  }, [activeStep]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardStatsView activeStep={activeStep} />;
      case 'menu':
        return <MenuBuilderView activeStep={activeStep} />;
      case 'qr':
        return <QRCodesView activeStep={activeStep} />;
      case 'analytics':
        return <AnalyticsView activeStep={activeStep} />;
      default:
        return <DashboardStatsView activeStep={activeStep} />;
    }
  };

  return (
    <div 
      className={cn(
        "flex bg-gray-50 rounded-xl overflow-hidden border border-gray-200 shadow-2xl",
        className
      )}
      style={{ minHeight: '500px' }}
    >
      <SimulatedSidebar activeStep={activeStep} />
      <main className="flex-1 p-5 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
};

// ============================================
// Demo Success Screen
// ============================================

export const DemoSuccessScreen: React.FC<{ onClose: () => void; onGetStarted: () => void }> = ({
  onClose,
  onGetStarted,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        You're All Set!
      </h2>
      <p className="text-gray-600 max-w-md mb-8">
        You've seen how DynamicMenu can help you create beautiful QR menus,
        manage items in real-time, and track analytics. Ready to get started?
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={onClose}>
          Close Demo
        </Button>
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={onGetStarted}
        >
          Get Started Free
        </Button>
      </div>
    </div>
  );
};

export default SimulatedDashboard;
