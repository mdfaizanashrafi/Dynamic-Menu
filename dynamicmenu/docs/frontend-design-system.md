# Frontend Design System

## Overview

DynamicMenu's frontend follows a modern, component-based architecture using React, TypeScript, and Tailwind CSS. This document outlines the design system, component patterns, and development guidelines.

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3.4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Routing**: React Router DOM 6
- **State**: React Context + Hooks

## Design Tokens

Design tokens are the foundational values that define the visual design system. They ensure consistency across the application.

### Color System

#### CSS Custom Properties

```css
/* Light Mode (Default) */
:root {
  /* Background Colors */
  --background: 0 0% 100%;           /* #FFFFFF - Page background */
  --foreground: 240 10% 3.9%;        /* #18181B - Primary text */
  
  /* Card & Popover */
  --card: 0 0% 100%;                 /* #FFFFFF - Card backgrounds */
  --card-foreground: 240 10% 3.9%;   /* #18181B - Card text */
  --popover: 0 0% 100%;              /* #FFFFFF - Dropdown/popover bg */
  --popover-foreground: 240 10% 3.9%;
  
  /* Primary (Brand) - Orange */
  --primary: 17 90% 60%;             /* #FF6B35 - Brand orange */
  --primary-foreground: 0 0% 98%;    /* #FAFAFA - Text on primary */
  
  /* Secondary - Neutral */
  --secondary: 240 4.8% 95.9%;       /* #F4F4F5 - Secondary bg */
  --secondary-foreground: 240 5.9% 10%;
  
  /* Muted - Subtle backgrounds */
  --muted: 240 4.8% 95.9%;           /* #F4F4F5 */
  --muted-foreground: 240 3.8% 46.1%; /* #71717A - Muted text */
  
  /* Accent - Purple */
  --accent: 262 83% 58%;             /* #8B5CF6 - Accent purple */
  --accent-foreground: 0 0% 98%;
  
  /* Destructive - Red */
  --destructive: 0 84.2% 60.2%;      /* #EF4444 - Error/Danger */
  --destructive-foreground: 0 0% 98%;
  
  /* Borders & Inputs */
  --border: 240 5.9% 90%;            /* #E4E4E7 - Borders */
  --input: 240 5.9% 90%;             /* #E4E4E7 - Input borders */
  --ring: 240 5.9% 10%;              /* #18181B - Focus ring */
  
  /* Border Radius */
  --radius: 0.625rem;                /* 10px - Base radius */
}

/* Dark Mode */
.dark {
  --background: 240 10% 3.9%;        /* #18181B */
  --foreground: 0 0% 98%;            /* #FAFAFA */
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 3.9%;
  --popover-foreground: 0 0% 98%;
  --primary: 17 90% 60%;             /* Orange kept consistent */
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;       /* #27272A */
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
}
```

#### Brand Colors

| Name | Hex | HSL | Usage |
|------|-----|-----|-------|
| Primary Orange | `#FF6B35` | `17 90% 60%` | CTAs, buttons, links |
| Primary Orange Dark | `#E55A2B` | `17 85% 53%` | Hover states |
| Primary Orange Light | `#FF8A5B` | `17 100% 67%` | Light accents |
| Success Green | `#16A34A` | `142 71% 41%` | Success states |
| Warning Yellow | `#F59E0B` | `38 92% 50%` | Warnings |
| Error Red | `#DC2626` | `0 84% 52%` | Errors |
| Accent Purple | `#8B5CF6` | `262 83% 58%` | Special features |

#### Neutral Colors (Gray Scale)

| Name | Hex | Tailwind | Usage |
|------|-----|----------|-------|
| Gray 50 | `#F9FAFB` | `gray-50` | Light backgrounds |
| Gray 100 | `#F3F4F6` | `gray-100` | Subtle backgrounds |
| Gray 200 | `#E5E7EB` | `gray-200` | Borders, dividers |
| Gray 300 | `#D1D5DB` | `gray-300` | Disabled states |
| Gray 400 | `#9CA3AF` | `gray-400` | Placeholder text |
| Gray 500 | `#6B7280` | `gray-500` | Secondary text |
| Gray 600 | `#4B5563` | `gray-600` | Body text |
| Gray 700 | `#374151` | `gray-700` | Emphasized text |
| Gray 800 | `#1F2937` | `gray-800` | Headings |
| Gray 900 | `#111827` | `gray-900` | Strong headings |

### Typography

#### Font Family

```css
/* Primary Font Stack */
font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

#### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 | `text-4xl sm:text-5xl lg:text-6xl` | `font-bold` | `leading-tight` | `tracking-tight` |
| H2 | `text-3xl sm:text-4xl` | `font-bold` | `leading-tight` | `tracking-tight` |
| H3 | `text-xl sm:text-2xl` | `font-semibold` | `leading-snug` | `tracking-tight` |
| H4 | `text-lg` | `font-semibold` | `leading-snug` | `-` |
| Body Large | `text-lg` | `font-normal` | `leading-relaxed` | `-` |
| Body | `text-base` | `font-normal` | `leading-relaxed` | `-` |
| Body Small | `text-sm` | `font-normal` | `leading-relaxed` | `-` |
| Caption | `text-xs` | `font-medium` | `leading-normal` | `tracking-wide` |

```tsx
// Typography Examples
<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
  Main Heading
</h1>

<h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
  Section Heading
</h2>

<p className="text-base leading-relaxed text-gray-600">
  Body text for paragraphs and general content.
</p>

<span className="text-sm text-gray-500">
  Secondary text for captions and metadata.
</span>
```

### Spacing System

Base unit: `4px` (0.25rem)

| Token | Value | Pixels | Tailwind |
|-------|-------|--------|----------|
| space-1 | 0.25rem | 4px | `p-1`, `m-1`, `gap-1` |
| space-2 | 0.5rem | 8px | `p-2`, `m-2`, `gap-2` |
| space-3 | 0.75rem | 12px | `p-3`, `m-3`, `gap-3` |
| space-4 | 1rem | 16px | `p-4`, `m-4`, `gap-4` |
| space-5 | 1.25rem | 20px | `p-5`, `m-5`, `gap-5` |
| space-6 | 1.5rem | 24px | `p-6`, `m-6`, `gap-6` |
| space-8 | 2rem | 32px | `p-8`, `m-8`, `gap-8` |
| space-10 | 2.5rem | 40px | `p-10`, `m-10`, `gap-10` |
| space-12 | 3rem | 48px | `p-12`, `m-12`, `gap-12` |
| space-16 | 4rem | 64px | `p-16`, `m-16`, `gap-16` |

### Border Radius

| Token | Value | Pixels | Usage |
|-------|-------|--------|-------|
| radius-xs | 0.125rem | 2px | Small badges |
| radius-sm | 0.25rem | 4px | Inputs, small buttons |
| radius-md | 0.375rem | 6px | Default radius |
| radius-lg | 0.5rem | 8px | Cards, modals |
| radius-xl | 0.75rem | 12px | Large cards |
| radius-2xl | 1rem | 16px | Featured cards |
| radius-3xl | 1.5rem | 24px | Hero elements |
| radius-full | 9999px | - | Pills, avatars |

```css
/* CSS Variables for radius */
--radius-xs: calc(var(--radius) - 6px);   /* ~4px */
--radius-sm: calc(var(--radius) - 4px);   /* ~6px */
--radius-md: calc(var(--radius) - 2px);   /* ~8px */
--radius-lg: var(--radius);               /* ~10px */
--radius-xl: calc(var(--radius) + 4px);   /* ~14px */
```

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| shadow-xs | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Subtle elevation |
| shadow-sm | `0 1px 3px 0 rgb(0 0 0 / 0.1)` | Cards, inputs |
| shadow-md | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Dropdowns |
| shadow-lg | `0 10px 15px -3px rgb(0 0 0 / 0.1)` | Modals |
| shadow-xl | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Popovers |
| shadow-2xl | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | Overlays |

## Component Patterns

### Button Usage

```tsx
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash2 } from 'lucide-react';

// Primary Button (Main CTAs)
<Button className="bg-orange-500 hover:bg-orange-600 text-white">
  Create Restaurant
</Button>

// Secondary Button
<Button variant="secondary">
  Cancel
</Button>

// Outline Button
<Button variant="outline" className="border-gray-300">
  Learn More
</Button>

// Ghost Button
<Button variant="ghost" className="text-gray-600 hover:text-gray-900">
  Back
</Button>

// Destructive Button
<Button variant="destructive">
  <Trash2 className="w-4 h-4 mr-2" />
  Delete
</Button>

// Loading State
<Button disabled>
  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
  Saving...
</Button>

// With Icon
<Button className="bg-orange-500 hover:bg-orange-600 text-white">
  <Plus className="w-4 h-4 mr-2" />
  Add Item
</Button>

// Size Variants
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">
  <Plus className="w-4 h-4" />
</Button>
```

### Card Patterns

```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';

// Standard Card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter className="flex justify-between">
    <Button variant="ghost">Cancel</Button>
    <Button>Save</Button>
  </CardFooter>
</Card>

// Stats Card
<Card>
  <CardContent className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">Total Views</p>
        <p className="text-2xl font-bold text-gray-900">12,345</p>
        <p className="text-xs text-green-600 mt-1">+12% from last month</p>
      </div>
      <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
        <Eye className="w-5 h-5" />
      </div>
    </div>
  </CardContent>
</Card>

// Interactive/Hover Card
<Card className="hover:shadow-lg hover:border-orange-200 transition-all duration-300 cursor-pointer">
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>

// Feature Card
<Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-white">
  <CardContent className="p-6">
    <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center mb-4">
      <Sparkles className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Feature Title</h3>
    <p className="text-gray-600">Feature description text</p>
  </CardContent>
</Card>
```

### Form Patterns

```tsx
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

// Basic Input Group
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input 
    id="email" 
    type="email" 
    placeholder="you@example.com"
    className="h-10"
  />
  <p className="text-xs text-gray-500">We'll never share your email.</p>
</div>

// Input with Icon
<div className="relative">
  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  <Input className="pl-10 h-10" placeholder="Email address" />
</div>

// Error State
<div className="space-y-2">
  <Label htmlFor="name">Restaurant Name</Label>
  <Input 
    id="name" 
    placeholder="Enter name"
    aria-invalid="true"
    className="border-red-500 focus-visible:ring-red-500"
  />
  <p className="text-xs text-red-500">Name is required</p>
</div>

// Textarea
<div className="space-y-2">
  <Label htmlFor="description">Description</Label>
  <Textarea 
    id="description" 
    placeholder="Describe your restaurant..."
    rows={4}
  />
</div>

// Select Dropdown
<div className="space-y-2">
  <Label>Menu Type</Label>
  <Select>
    <SelectTrigger className="h-10">
      <SelectValue placeholder="Select type" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="main">Main Menu</SelectItem>
      <SelectItem value="breakfast">Breakfast</SelectItem>
      <SelectItem value="lunch">Lunch</SelectItem>
      <SelectItem value="dinner">Dinner</SelectItem>
    </SelectContent>
  </Select>
</div>

// Switch/Toggle
<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
  <div>
    <Label htmlFor="active" className="font-medium">Active Menu</Label>
    <p className="text-sm text-gray-500">Show this menu to customers</p>
  </div>
  <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
</div>

// Checkbox Group
<div className="space-y-3">
  <Label>Days Available</Label>
  <div className="flex flex-wrap gap-3">
    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
      <div key={day} className="flex items-center space-x-2">
        <Checkbox id={day} />
        <Label htmlFor={day} className="text-sm font-normal">{day}</Label>
      </div>
    ))}
  </div>
</div>

// Form Layout
<form className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Form fields */}
  </div>
  <div className="flex justify-end gap-3">
    <Button variant="outline" type="button">Cancel</Button>
    <Button type="submit">Save Changes</Button>
  </div>
</form>
```

### Badge Patterns

```tsx
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, AlertCircle } from 'lucide-react';

// Status Badges
<Badge className="bg-green-100 text-green-700 hover:bg-green-100">
  <Check className="w-3 h-3 mr-1" />
  Active
</Badge>

<Badge className="bg-red-100 text-red-700 hover:bg-red-100">
  <X className="w-3 h-3 mr-1" />
  Inactive
</Badge>

<Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
  <Clock className="w-3 h-3 mr-1" />
  Pending
</Badge>

<Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
  <AlertCircle className="w-3 h-3 mr-1" />
  Draft
</Badge>

// Feature Badges
<Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
  <Flame className="w-3 h-3 mr-1" />
  Popular
</Badge>

<Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
  <Sparkles className="w-3 h-3 mr-1" />
  Featured
</Badge>

// Outline Badge
<Badge variant="outline" className="border-gray-300 text-gray-600">
  Default
</Badge>

// Secondary Badge
<Badge variant="secondary">Secondary</Badge>

// Destructive Badge
<Badge variant="destructive">Deleted</Badge>
```

### Dialog/Modal Patterns

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

// Basic Dialog
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      {/* Form content */}
    </div>
    <DialogFooter>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Confirmation Dialog
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2 text-red-600">
        <AlertTriangle className="w-5 h-5" />
        Delete Item
      </DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this item? This action cannot be undone.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter className="gap-3 sm:gap-0">
      <DialogClose asChild>
        <Button variant="outline">Cancel</Button>
      </DialogClose>
      <Button variant="destructive" onClick={handleDelete}>
        Delete
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Alert Dialog (for important confirmations)
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete Account</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone. This will permanently delete your account.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
        Continue
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Toast Notifications

```tsx
import { toast } from 'sonner';

// Success Toast
toast.success('Restaurant created successfully');

// Error Toast
toast.error('Failed to save changes', {
  description: 'Please check your connection and try again.',
});

// Info Toast
toast.info('New update available', {
  action: {
    label: 'Update',
    onClick: () => window.location.reload(),
  },
});

// Promise Toast
toast.promise(saveData(), {
  loading: 'Saving...',
  success: 'Changes saved',
  error: 'Failed to save',
});

// Custom Toast
toast.custom((t) => (
  <div className="bg-white p-4 rounded-lg shadow-lg border">
    <p className="font-medium">Custom Notification</p>
    <Button size="sm" onClick={() => toast.dismiss(t)}>Dismiss</Button>
  </div>
));
```

### Table Patterns

```tsx
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

// Basic Table
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Price</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map((item) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{item.name}</TableCell>
        <TableCell>
          <Badge variant={item.isActive ? 'default' : 'secondary'}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </TableCell>
        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

// Table with Loading State
{isLoading ? (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Price</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
) : (
  // Actual table
)}

// Empty State
{items.length === 0 && (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Inbox className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-1">No items yet</h3>
    <p className="text-gray-500 mb-4">Get started by adding your first item.</p>
    <Button>Add Item</Button>
  </div>
)}
```

## Layout Patterns

### Container

```tsx
// Max-width container (standard)
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

// Narrow container (forms, articles)
<div className="max-w-3xl mx-auto px-4">
  {/* Content */}
</div>

// Full-width with inner padding
<div className="w-full px-4 sm:px-6 lg:px-8 py-12">
  {/* Content */}
</div>
```

### Grid Layouts

```tsx
// Stats Grid (4 columns on large screens)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard />
  <StatCard />
  <StatCard />
  <StatCard />
</div>

// Feature Grid (3 columns)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
  {features.map((feature) => (
    <FeatureCard key={feature.id} {...feature} />
  ))}
</div>

// Menu Items Grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {items.map((item) => (
    <MenuItemCard key={item.id} {...item} />
  ))}
</div>

// Dashboard Layout (sidebar + content)
<div className="min-h-screen bg-gray-50">
  <Sidebar />
  <main className="lg:ml-64 p-4 sm:p-6 lg:p-8">
    {/* Page content */}
  </main>
</div>

// Split Layout
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-2">
    {/* Main content */}
  </div>
  <div className="lg:col-span-1">
    {/* Sidebar content */}
  </div>
</div>
```

### Flex Patterns

```tsx
// Center content (auth pages)
<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <div className="w-full max-w-md">
    {/* Auth form */}
  </div>
</div>

// Space between (header)
<div className="flex items-center justify-between py-4">
  <div className="flex items-center gap-4">
    <Logo />
    <Navigation />
  </div>
  <UserMenu />
</div>

// Vertical stack with gap
<div className="flex flex-col gap-6">
  <Section />
  <Section />
  <Section />
</div>

// Horizontal scroll (mobile categories)
<div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
  {categories.map((cat) => (
    <Button key={cat.id} variant="outline" size="sm">
      {cat.name}
    </Button>
  ))}
</div>
```

## Animation Patterns

### Transitions

```css
/* Standard transitions */
.transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.transition-colors { transition: color 0.2s, background-color 0.2s, border-color 0.2s; }
.transition-transform { transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.transition-opacity { transition: opacity 0.2s; }
```

### Hover Effects

```tsx
// Scale on hover
<div className="hover:scale-105 transition-transform duration-300">
  {/* Card content */}
</div>

// Shadow on hover
<div className="hover:shadow-xl transition-shadow duration-300">
  {/* Card content */}
</div>

// Combined hover effect
<div className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
  <div className="group-hover:bg-orange-50 transition-colors">
    {/* Content */}
  </div>
</div>

// Image zoom on hover
<div className="overflow-hidden rounded-lg">
  <img 
    className="hover:scale-110 transition-transform duration-500"
    src="/image.jpg"
    alt=""
  />
</div>
```

### Loading States

```tsx
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton Card
<div className="space-y-3">
  <Skeleton className="h-[200px] w-full rounded-lg" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>

// Skeleton List
<div className="space-y-4">
  {[...Array(5)].map((_, i) => (
    <div key={i} className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ))}
</div>

// Spinner
import { Loader2 } from 'lucide-react';

<Loader2 className="w-6 h-6 animate-spin text-orange-500" />

// Page loading
<div className="flex items-center justify-center min-h-[400px]">
  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
</div>
```

## Responsive Design

### Breakpoints

| Name | Min Width | CSS |
|------|-----------|-----|
| sm | 640px | `@media (min-width: 640px)` |
| md | 768px | `@media (min-width: 768px)` |
| lg | 1024px | `@media (min-width: 1024px)` |
| xl | 1280px | `@media (min-width: 1280px)` |
| 2xl | 1536px | `@media (min-width: 1536px)` |

### Mobile-First Pattern

```tsx
// Base styles for mobile (smallest screens)
// sm: Small screens and up
// md: Medium screens and up
// lg: Large screens and up
// xl: Extra large screens and up

<div className="
  grid
  grid-cols-1      /* Mobile: 1 column */
  sm:grid-cols-2  /* Small: 2 columns */
  md:grid-cols-3  /* Medium: 3 columns */
  lg:grid-cols-4  /* Large: 4 columns */
  gap-4           /* Gap: 16px on all screens */
  sm:gap-6        /* Gap: 24px on small+ */
  lg:gap-8        /* Gap: 32px on large+ */
">
  {/* Content */}
</div>

// Responsive text
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
  Responsive Heading
</h1>

// Responsive padding
<div className="p-4 sm:p-6 lg:p-8">
  {/* Content */}
</div>

// Responsive visibility
<div className="hidden md:block">
  {/* Desktop only */}
</div>
<div className="md:hidden">
  {/* Mobile only */}
</div>
```

## Common UI Patterns

### Navigation

```tsx
// Top Navigation
<nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between h-16">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl">DynamicMenu</span>
        </Link>
        <div className="hidden md:flex items-center gap-4">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/analytics">Analytics</NavLink>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <UserMenu />
      </div>
    </div>
  </div>
</nav>

// Sidebar Navigation
<aside className="fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-200">
  <div className="p-4">
    <Logo />
  </div>
  <nav className="px-3 py-2 space-y-1">
    <NavItem icon={LayoutDashboard} to="/dashboard">Dashboard</NavItem>
    <NavItem icon={Menu} to="/menu">Menu</NavItem>
    <NavItem icon={QrCode} to="/qr">QR Codes</NavItem>
    <NavItem icon={BarChart3} to="/analytics">Analytics</NavItem>
    <NavItem icon={Settings} to="/settings">Settings</NavItem>
  </nav>
</aside>
```

### Page Header

```tsx
// Standard Page Header
<div className="mb-8">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Page Title</h1>
      <p className="text-gray-500 mt-1">Page description goes here</p>
    </div>
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Add New
    </Button>
  </div>
</div>

// With Breadcrumbs
<div className="mb-8">
  <Breadcrumb>
    <BreadcrumbItem>
      <Link to="/dashboard">Dashboard</Link>
    </BreadcrumbItem>
    <BreadcrumbItem>
      <Link to="/menu">Menu</Link>
    </BreadcrumbItem>
    <BreadcrumbItem isCurrent>Categories</BreadcrumbItem>
  </Breadcrumb>
  <h1 className="text-2xl font-bold text-gray-900 mt-4">Categories</h1>
</div>

// With Tabs
<div className="mb-8">
  <h1 className="text-2xl font-bold text-gray-900 mb-4">Settings</h1>
  <Tabs defaultValue="general">
    <TabsList>
      <TabsTrigger value="general">General</TabsTrigger>
      <TabsTrigger value="appearance">Appearance</TabsTrigger>
      <TabsTrigger value="notifications">Notifications</TabsTrigger>
    </TabsList>
  </Tabs>
</div>
```

### Data Display

```tsx
// Definition List
<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <dt className="text-sm font-medium text-gray-500">Restaurant Name</dt>
    <dd className="mt-1 text-sm text-gray-900">Bistro Central</dd>
  </div>
  <div>
    <dt className="text-sm font-medium text-gray-500">Created</dt>
    <dd className="mt-1 text-sm text-gray-900">Jan 15, 2024</dd>
  </div>
</dl>

// Key-Value Grid
<div className="grid grid-cols-2 gap-4 py-4">
  <div className="bg-gray-50 p-4 rounded-lg">
    <p className="text-sm text-gray-500">Total Orders</p>
    <p className="text-2xl font-bold text-gray-900">1,234</p>
  </div>
  <div className="bg-gray-50 p-4 rounded-lg">
    <p className="text-sm text-gray-500">Revenue</p>
    <p className="text-2xl font-bold text-gray-900">$12,345</p>
  </div>
</div>
```

### Search & Filter

```tsx
// Search Input with Icon
<div className="relative max-w-md">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
  <Input 
    className="pl-10"
    placeholder="Search items..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
</div>

// Filter Dropdown
<div className="flex items-center gap-3">
  <Select value={filter} onValueChange={setFilter}>
    <SelectTrigger className="w-[140px]">
      <Filter className="w-4 h-4 mr-2" />
      <SelectValue placeholder="Filter" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Items</SelectItem>
      <SelectItem value="active">Active</SelectItem>
      <SelectItem value="inactive">Inactive</SelectItem>
    </SelectContent>
  </Select>
  
  <Button variant="outline" size="icon" onClick={clearFilters}>
    <X className="w-4 h-4" />
  </Button>
</div>
```

### Pagination

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious 
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
      />
    </PaginationItem>
    
    {pages.map((p) => (
      <PaginationItem key={p}>
        <PaginationLink
          isActive={page === p}
          onClick={() => setPage(p)}
        >
          {p}
        </PaginationLink>
      </PaginationItem>
    ))}
    
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    
    <PaginationItem>
      <PaginationNext 
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

## Page Templates

### Landing Page

```tsx
const LandingPage = () => (
  <div className="min-h-screen bg-white">
    <Navigation />
    
    {/* Hero Section */}
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
            Digital Menus Made{' '}
            <span className="text-orange-500">Simple</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600">
            Create beautiful QR code menus for your restaurant in minutes.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline">
              View Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
    
    {/* Features Section */}
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Features</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature cards */}
        </div>
      </div>
    </section>
    
    {/* CTA Section */}
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Ready to get started?
        </h2>
        <Button size="lg" className="bg-orange-500 hover:bg-orange-600">
          Create Your Menu
        </Button>
      </div>
    </section>
    
    <Footer />
  </div>
);
```

### Dashboard Page

```tsx
const DashboardPage = () => (
  <div className="min-h-screen bg-gray-50">
    <Sidebar />
    
    <main className="lg:ml-64 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Views" value="12,345" trend="+12%" />
        <StatCard title="QR Scans" value="3,456" trend="+8%" />
        <StatCard title="Active Items" value="48" />
        <StatCard title="Revenue" value="$8,420" trend="+15%" />
      </div>
      
      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Activity list */}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                Add Menu Item
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR Code
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  </div>
);
```

### Auth Page

```tsx
const AuthPage = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Utensils className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-500 mt-1">Sign in to your account</p>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
            <Button className="w-full bg-orange-500 hover:bg-orange-600">
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  </div>
);
```

## Best Practices

### Component Structure

```tsx
// ✅ Good: Clear structure, typed props
interface MenuItemCardProps {
  item: MenuItem;
  onToggle: (id: string) => void;
  variant?: 'default' | 'compact';
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ 
  item, 
  onToggle,
  variant = 'default' 
}) => {
  const isCompact = variant === 'compact';
  
  return (
    <Card className={isCompact ? 'p-4' : 'p-6'}>
      {/* Content */}
    </Card>
  );
};

// ❌ Bad: No types, unclear structure
const Item = (props) => {
  return <div>...</div>;
};
```

### State Management

```tsx
// ✅ Good: useState for local state
const [isOpen, setIsOpen] = useState(false);

// ✅ Good: useCallback for event handlers
const handleClick = useCallback(() => {
  setIsOpen(prev => !prev);
}, []);

// ✅ Good: Context for global state
const { user, login, logout } = useAuth();

// ✅ Good: Custom hooks for complex logic
const { items, loading, error, refresh } = useMenuItems(restaurantId);
```

### Performance

```tsx
// ✅ Good: Memoize expensive computations
const filteredItems = useMemo(() => {
  return items.filter(item => item.isAvailable);
}, [items]);

// ✅ Good: Memoize callbacks
const handleDelete = useCallback((id: string) => {
  deleteItem(id);
}, [deleteItem]);

// ✅ Good: Memoize components
const MemoizedItemCard = memo(ItemCard);

// ✅ Good: Lazy load heavy components
const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));
```

## File Organization

```
src/
├── pages/                 # Page components (route-level)
│   ├── LandingPage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   └── MenuPage.tsx
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── menu/             # Menu-specific components
│   │   ├── MenuItemCard.tsx
│   │   ├── CategoryList.tsx
│   │   └── MenuBuilder.tsx
│   ├── dashboard/        # Dashboard-specific components
│   │   ├── StatCard.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── QuickActions.tsx
│   └── layout/           # Layout components
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── Footer.tsx
├── contexts/             # React contexts
│   └── AuthContext.tsx
├── hooks/                # Custom hooks
│   ├── useAuth.ts
│   ├── useMenu.ts
│   └── useRestaurant.ts
├── lib/                  # Utilities
│   ├── utils.ts
│   └── api.ts
├── types/                # TypeScript types
│   └── index.ts
└── styles/               # Global styles
    └── index.css
```

## Accessibility

### ARIA Labels

```tsx
// ✅ Good: Descriptive labels
<button aria-label="Close menu" onClick={closeMenu}>
  <X className="w-6 h-6" />
</button>

// ✅ Good: Role attributes
<div role="alert" className="bg-red-100 text-red-700 p-4">
  Error message
</div>

// ✅ Good: ARIA states
<button aria-expanded={isOpen} aria-controls="menu-content">
  Toggle Menu
</button>
<div id="menu-content" hidden={!isOpen}>
  {/* Menu content */}
</div>
```

### Keyboard Navigation

```tsx
// ✅ Good: Focusable elements
<button className="focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
  Click me
</button>

// ✅ Good: Tab index
<div tabIndex={0} onKeyDown={handleKeyDown} role="button">
  Interactive element
</div>

// ✅ Good: Skip link
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
<main id="main-content">
  {/* Main content */}
</main>
```

### Color Contrast

- All text must have contrast ratio ≥ 4.5:1
- Large text (18pt+) can have contrast ratio ≥ 3:1
- Use tools like WebAIM Contrast Checker

```tsx
// ✅ Good: Sufficient contrast
<p className="text-gray-900 bg-white">High contrast text</p>
<p className="text-gray-600 bg-gray-100">Medium contrast text</p>

// ❌ Bad: Poor contrast
<p className="text-gray-400 bg-white">Low contrast text</p>
```
