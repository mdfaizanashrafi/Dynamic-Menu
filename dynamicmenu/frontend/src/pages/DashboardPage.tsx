/**
 * Dashboard Page
 * Restaurant owner dashboard for managing menus
 */

import { useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Utensils, QrCode, BarChart3, Settings as SettingsIcon,
  ChevronRight, Plus, Search, MoreVertical, Edit, Trash2,
  Eye, Download, Copy, Check, X, ArrowUpRight, TrendingUp,
  Users, Clock, Star, Flame, Leaf, Image as ImageIcon,
  RefreshCw, Palette, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { QRDesignOptions } from '@/types';
import { QRCodeSize, QRFrameStyle, QRCodeType } from '@/types';
import { QRDesigner, QRPreviewModal } from '@/components/qr';
import { 
  downloadQRImage, 
  getAllQRCodeSizes, 
  getQRCodeDimensions,
  downloadQRCodeZip,
} from '@/services/qr.service';

// Sidebar Component
const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Utensils, label: 'Menu Builder', path: '/dashboard/menu' },
    { icon: QrCode, label: 'QR Codes', path: '/dashboard/qr' },
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
    { icon: SettingsIcon, label: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0">
      <div className="p-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">DynamicMenu</span>
        </Link>
      </div>

      <nav className="px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-600 font-medium">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">John Doe</p>
            <p className="text-sm text-gray-500 truncate">john@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

// Dashboard Home
const DashboardHome = () => {
  const stats = [
    { label: 'Total Views', value: '2,847', change: '+12%', icon: Eye, color: 'bg-blue-100 text-blue-700' },
    { label: 'Unique Visitors', value: '1,234', change: '+8%', icon: Users, color: 'bg-green-100 text-green-700' },
    { label: 'Avg. Session', value: '3m 24s', change: '+15%', icon: Clock, color: 'bg-purple-100 text-purple-700' },
    { label: 'QR Scans', value: '892', change: '+23%', icon: QrCode, color: 'bg-orange-100 text-orange-700' },
  ];

  const popularItems = [
    { name: 'Margherita Pizza', views: 456, orders: 89, image: '' },
    { name: 'Spaghetti Carbonara', views: 389, orders: 67, image: '' },
    { name: 'Tiramisu', views: 312, orders: 54, image: '' },
    { name: 'Bruschetta', views: 298, orders: 45, image: '' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your menu.</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">{stat.change}</span>
                    <span className="text-sm text-gray-500">vs last week</span>
                  </div>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Popular Items */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Popular Items</CardTitle>
            <Button variant="ghost" size="sm" className="text-orange-600">
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularItems.map((item, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{item.views} views</span>
                      <span>{item.orders} orders</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="w-4 h-4 mr-2" />
              Add New Category
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR Code
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="w-4 h-4 mr-2" />
              Export Menu
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Eye className="w-4 h-4 mr-2" />
              Preview Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Menu Builder
const MenuBuilder = () => {
  const [categories, setCategories] = useState([
    { id: '1', name: 'Starters', itemCount: 4 },
    { id: '2', name: 'Pizza', itemCount: 8 },
    { id: '3', name: 'Pasta', itemCount: 6 },
    { id: '4', name: 'Desserts', itemCount: 3 },
  ]);

  const [menuItems, setMenuItems] = useState([
    { id: '1', name: 'Bruschetta', price: 8.99, category: 'Starters', isAvailable: true, isPopular: true },
    { id: '2', name: 'Margherita Pizza', price: 14.99, category: 'Pizza', isAvailable: true, isPopular: true },
    { id: '3', name: 'Spaghetti Carbonara', price: 15.99, category: 'Pasta', isAvailable: true, isPopular: false },
    { id: '4', name: 'Tiramisu', price: 7.99, category: 'Desserts', isAvailable: true, isPopular: true },
  ]);

  const toggleAvailability = (id: string) => {
    setMenuItems(items =>
      items.map(item =>
        item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
      )
    );
    toast.success('Availability updated');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Builder</h1>
          <p className="text-gray-600">Manage your categories and menu items</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <Tabs defaultValue="items" className="space-y-6">
        <TabsList>
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input placeholder="Search menu items..." className="pl-10" />
            </div>
            <select className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600">
              <option>All Categories</option>
              {categories.map(cat => <option key={cat.id}>{cat.name}</option>)}
            </select>
          </div>

          {/* Items Table */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {menuItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.isPopular && (
                            <Badge className="bg-orange-100 text-orange-700">
                              <Flame className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{item.category} • ${item.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Available</span>
                        <Switch
                          checked={item.isAvailable}
                          onCheckedChange={() => toggleAvailability(item.id)}
                        />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{category.itemCount} items</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Add Category Card */}
            <Card className="border-dashed border-2 hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center justify-center h-full min-h-[120px]">
                <Plus className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-gray-600 font-medium">Add Category</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// QR Code Types
interface QRCodeData {
  id: string;
  name: string;
  type: QRCodeType;
  tableNumber?: number;
  code: string;
  redirectUrl: string;
  scanCount: number;
  pngUrl?: string;
  svgUrl?: string;
  downloadUrls?: {
    small: { png: string; svg: string };
    medium: { png: string; svg: string };
    large: { png: string; svg: string };
    xl: { png: string; svg: string };
  };
}

// Enhanced QR Codes Component
const QRCodes = () => {
  // Mock data with proper QR code images
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([
    { 
      id: '1', 
      name: 'Table 1', 
      type: QRCodeType.TABLE, 
      tableNumber: 1, 
      code: 'ABC123',
      redirectUrl: 'https://dynamicmenu.app/menu/abc123',
      scanCount: 234,
      pngUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://dynamicmenu.app/menu/abc123',
      downloadUrls: {
        small: { png: '', svg: '' },
        medium: { png: '', svg: '' },
        large: { png: '', svg: '' },
        xl: { png: '', svg: '' },
      }
    },
    { 
      id: '2', 
      name: 'Table 2', 
      type: QRCodeType.TABLE, 
      tableNumber: 2, 
      code: 'DEF456',
      redirectUrl: 'https://dynamicmenu.app/menu/def456',
      scanCount: 189,
      pngUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://dynamicmenu.app/menu/def456',
      downloadUrls: {
        small: { png: '', svg: '' },
        medium: { png: '', svg: '' },
        large: { png: '', svg: '' },
        xl: { png: '', svg: '' },
      }
    },
    { 
      id: '3', 
      name: 'Bar Counter', 
      type: QRCodeType.BAR, 
      code: 'GHI789',
      redirectUrl: 'https://dynamicmenu.app/menu/ghi789',
      scanCount: 456,
      pngUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://dynamicmenu.app/menu/ghi789',
      downloadUrls: {
        small: { png: '', svg: '' },
        medium: { png: '', svg: '' },
        large: { png: '', svg: '' },
        xl: { png: '', svg: '' },
      }
    },
    { 
      id: '4', 
      name: 'Takeaway', 
      type: QRCodeType.TAKEAWAY, 
      code: 'JKL012',
      redirectUrl: 'https://dynamicmenu.app/menu/jkl012',
      scanCount: 123,
      pngUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://dynamicmenu.app/menu/jkl012',
      downloadUrls: {
        small: { png: '', svg: '' },
        medium: { png: '', svg: '' },
        large: { png: '', svg: '' },
        xl: { png: '', svg: '' },
      }
    },
  ]);

  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [designOpen, setDesignOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  // Design options state
  const [designOptions, setDesignOptions] = useState<QRDesignOptions>({
    color: '#000000',
    frameStyle: QRFrameStyle.NONE,
  });

  // New QR form state
  const [newQRName, setNewQRName] = useState('');
  const [newQRType, setNewQRType] = useState<QRCodeType>(QRCodeType.TABLE);
  const [newQRTableNumber, setNewQRTableNumber] = useState<number>(1);

  const sizeOptions = getAllQRCodeSizes();

  const handlePreview = (qr: QRCodeData) => {
    setSelectedQR(qr);
    setPreviewOpen(true);
  };

  const handleCopyLink = (qr: QRCodeData) => {
    navigator.clipboard.writeText(qr.redirectUrl);
    setCopiedId(qr.id);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (qr: QRCodeData, size: QRCodeSize, format: 'png' | 'svg') => {
    if (qr.pngUrl) {
      const filename = `${qr.name.replace(/\s+/g, '-').toLowerCase()}-${size.toLowerCase()}.${format}`;
      downloadQRImage(qr.pngUrl, filename);
      toast.success(`Downloading ${size.toLowerCase()} ${format.toUpperCase()}`);
    }
  };

  const handleDownloadZip = async (qr: QRCodeData) => {
    toast.success('Preparing ZIP download...');
    // In real implementation, call downloadQRCodeZip
  };

  const handleRegenerate = async (qr: QRCodeData) => {
    setRegeneratingId(qr.id);
    // Simulate regeneration
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRegeneratingId(null);
    toast.success(`${qr.name} regenerated with new branding`);
  };

  const handleCreateQR = () => {
    if (!newQRName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    const newQR: QRCodeData = {
      id: Date.now().toString(),
      name: newQRName,
      type: newQRType,
      tableNumber: newQRType === QRCodeType.TABLE ? newQRTableNumber : undefined,
      code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      redirectUrl: `https://dynamicmenu.app/menu/${Math.random().toString(36).substring(2, 8)}`,
      scanCount: 0,
      pngUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=demo`,
    };

    setQrCodes([newQR, ...qrCodes]);
    setCreateOpen(false);
    setNewQRName('');
    toast.success(`${newQRName} created successfully`);
  };

  const handleDelete = (qr: QRCodeData) => {
    setQrCodes(qrCodes.filter(q => q.id !== qr.id));
    toast.success(`${qr.name} deleted`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Codes</h1>
          <p className="text-gray-600">Generate and manage branded QR codes for your restaurant</p>
        </div>
        <Button 
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Generate QR Code
        </Button>
      </div>

      {/* QR Code Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {qrCodes.map((qr) => (
          <Card key={qr.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              {/* QR Preview */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => handlePreview(qr)}
                >
                  <div className="bg-white rounded-xl shadow-md p-3">
                    <img
                      src={qr.pngUrl}
                      alt={`${qr.name} QR Code`}
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Eye className="w-8 h-8 text-white" />
                  </div>

                  {/* Regenerating spinner */}
                  {regeneratingId === qr.id && (
                    <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* QR Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{qr.name}</h3>
                    <p className="text-sm text-gray-500">
                      {qr.type}{qr.tableNumber && ` • Table #${qr.tableNumber}`}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handlePreview(qr)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopyLink(qr)}>
                        {copiedId === qr.id ? (
                          <>
                            <Check className="w-4 h-4 mr-2 text-green-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Link
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleRegenerate(qr)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Regenerate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDelete(qr)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    {qr.scanCount.toLocaleString()} scans
                  </span>
                </div>

                {/* Download Options */}
                <div className="space-y-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                        <ChevronRight className="w-4 h-4 ml-auto rotate-90" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      {sizeOptions.map((size) => (
                        <DropdownMenuItem
                          key={size.value}
                          onClick={() => handleDownload(qr, size.value, 'png')}
                        >
                          <span className="flex-1">{size.label}</span>
                          <span className="text-xs text-gray-400">{size.width}px</span>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDownloadZip(qr)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download All (ZIP)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => handlePreview(qr)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview & Print
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {/* Add QR Card */}
        <Card 
          className="border-dashed border-2 hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer min-h-[420px] flex flex-col"
          onClick={() => setCreateOpen(true)}
        >
          <CardContent className="p-6 flex flex-col items-center justify-center flex-1">
            <Plus className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium">Generate New QR Code</p>
            <p className="text-sm text-gray-400 text-center mt-2">
              Create branded QR codes for tables, counters, or takeaway
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      <QRPreviewModal
        qrCode={selectedQR}
        downloadUrls={selectedQR?.downloadUrls || null}
        isOpen={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setSelectedQR(null);
        }}
      />

      {/* Create QR Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New QR Code</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Name Input */}
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                placeholder="e.g., Table 1, Bar Counter, Entrance"
                value={newQRName}
                onChange={(e) => setNewQRName(e.target.value)}
              />
            </div>

            {/* Type Selection */}
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-3 gap-3">
                {Object.values(QRCodeType).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewQRType(type)}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      newQRType === type
                        ? 'border-orange-500 bg-orange-50 text-orange-900'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Table Number (if TABLE type) */}
            {newQRType === QRCodeType.TABLE && (
              <div className="space-y-2">
                <Label>Table Number</Label>
                <Input
                  type="number"
                  min={1}
                  value={newQRTableNumber}
                  onChange={(e) => setNewQRTableNumber(parseInt(e.target.value) || 1)}
                />
              </div>
            )}

            {/* Design Preview */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
              <div className="bg-gray-100 rounded-xl p-6 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-md p-4">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=demo&color=${designOptions.color.replace('#', '')}`}
                    alt="Preview"
                    className="w-32 h-32 object-contain"
                  />
                  <p className="text-center text-xs text-gray-400 mt-2">
                    Powered by DynamicMenu
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleCreateQR}
            >
              Create QR Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Analytics
const Analytics = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track your menu performance and customer engagement</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Menu Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 bg-orange-500 rounded-t-sm hover:bg-orange-600 transition-colors"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between mt-4 text-sm text-gray-500">
              <span>Jan</span>
              <span>Mar</span>
              <span>Jun</span>
              <span>Sep</span>
              <span>Dec</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Mobile', value: 68, color: 'bg-orange-500' },
                { label: 'Desktop', value: 24, color: 'bg-blue-500' },
                { label: 'Tablet', value: 8, color: 'bg-green-500' },
              ].map((device) => (
                <div key={device.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{device.label}</span>
                    <span className="font-medium">{device.value}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${device.color} rounded-full`}
                      style={{ width: `${device.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Settings
const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your restaurant profile and preferences</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Restaurant Name</Label>
                <Input defaultValue="Bella Vista" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input defaultValue="+1 (555) 123-4567" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input defaultValue="123 Main Street, New York, NY 10001" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                className="w-full px-3 py-2 border border-gray-200 rounded-lg min-h-[100px]"
                defaultValue="Authentic Italian cuisine with a modern twist"
              />
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  <Input defaultValue="#FF6B35" />
                  <div className="w-10 h-10 rounded-lg bg-orange-500 border border-gray-200" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Secondary Color</Label>
                <div className="flex gap-2">
                  <Input defaultValue="#16A34A" />
                  <div className="w-10 h-10 rounded-lg bg-green-500 border border-gray-200" />
                </div>
              </div>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Main Dashboard Page
const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 p-8">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/menu" element={<MenuBuilder />} />
          <Route path="/qr" element={<QRCodes />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
};

export default DashboardPage;
