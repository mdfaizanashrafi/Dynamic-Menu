/**
 * DynamicMenu Landing Page
 * Marketing website with modern SaaS design
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Menu, X, ChevronRight, QrCode,
  Zap, TrendingUp, Clock, Globe, Shield, ArrowRight,
  Star, CheckCircle2, Utensils, Play, MousePointer,
  Sparkles, Smartphone, Users, DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DemoModal, 
  DemoSection, 
  ExitIntentModal,
  TourTrigger,
  DemoPreviewCard 
} from '@/components/demo';

// ============================================
// Exit Intent Hook
// ============================================

const useExitIntent = (onExitIntent: () => void, enabled: boolean = true) => {
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (!enabled || hasTriggered) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves from the top of the page
      if (e.clientY < 10 && e.relatedTarget === null) {
        setHasTriggered(true);
        onExitIntent();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [onExitIntent, enabled, hasTriggered]);

  return { hasTriggered };
};

// ============================================
// Navigation Component
// ============================================

const Navigation = ({ onOpenDemo }: { onOpenDemo: () => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Demo', href: '#demo' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">DynamicMenu</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={onOpenDemo}
              className="text-gray-600 hover:text-orange-600 font-medium transition-colors inline-flex items-center gap-1"
            >
              <Play className="w-4 h-4" />
              See Demo
            </button>
            <a href="/login" className="text-gray-600 hover:text-gray-900 font-medium">
              Sign In
            </a>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Get Started Free
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t py-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t pt-4 px-4 flex flex-col gap-3">
                <button 
                  onClick={() => {
                    onOpenDemo();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-gray-600 font-medium text-left inline-flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  See Demo
                </button>
                <a href="/login" className="text-gray-600 font-medium">
                  Sign In
                </a>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full">
                  Get Started Free
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// ============================================
// Hero Section
// ============================================

const HeroSection = ({ onOpenDemo }: { onOpenDemo: () => void }) => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-green-50" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-200/30 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="space-y-8">
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 px-4 py-1.5 text-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
              Now with AI-Powered Menu Insights
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              The Easiest Way to Create{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                Beautiful QR Menus
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-xl">
              Update your menu instantly from anywhere. No reprinting, no hassle. 
              Let customers scan, browse, and order with ease.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Link to="/demo">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  <Smartphone className="w-5 h-5 mr-2" />
                  View Demo Menu
                </Button>
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:items-center text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                14-day free trial
              </div>
              <Link 
                to="/demo"
                className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium sm:ml-2"
              >
                <Play className="w-4 h-4" />
                See it in action
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 sm:gap-8 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">1,000+</p>
                  <p className="text-sm text-gray-500">Restaurants</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">$500/mo</p>
                  <p className="text-sm text-gray-500">Average Savings</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">Unlimited</p>
                  <p className="text-sm text-gray-500">QR Codes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image / Mockup */}
          <div className="relative">
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
              {/* Phone Mockup */}
              <div className="bg-gray-900 rounded-[2.5rem] p-3 max-w-sm mx-auto">
                <div className="bg-white rounded-[2rem] overflow-hidden">
                  {/* Mock Header */}
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Bella Vista</h3>
                        <p className="text-xs text-white/80">Italian Cuisine</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mock Menu */}
                  <div className="p-4 space-y-4">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {['All', 'Starters', 'Mains', 'Desserts'].map((cat, i) => (
                        <span
                          key={cat}
                          className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                            i === 0 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                    
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">Margherita Pizza</h4>
                            <span className="text-orange-600 font-semibold text-sm">$14</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Fresh tomatoes, mozzarella, basil</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating QR Code */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                <div className="w-24 h-24 bg-gray-900 rounded-xl flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-white" />
                </div>
                <p className="text-xs text-center mt-2 text-gray-500">Scan to view</p>
              </div>

              {/* Demo Badge */}
              <button
                onClick={onOpenDemo}
                className="absolute -top-4 -left-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 hover:shadow-xl hover:scale-105 transition-all"
              >
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">Try the Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================
// Features Section
// ============================================

const FeaturesSection = ({ onOpenDemo }: { onOpenDemo: () => void }) => {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Instant Updates',
      description: 'Update prices, items, or availability in real-time. Changes reflect immediately on all QR codes.',
      color: 'bg-yellow-100 text-yellow-700',
    },
    {
      icon: <QrCode className="w-6 h-6" />,
      title: 'Unlimited QR Codes',
      description: 'Generate QR codes for tables, rooms, bars, or takeout. Download as PNG, SVG, or PDF.',
      color: 'bg-orange-100 text-orange-700',
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Analytics & Insights',
      description: 'Track menu views, popular items, and peak hours. Make data-driven decisions.',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Multi-Language Support',
      description: 'Support for English, Arabic, French, Hindi and more. Customers choose their language.',
      color: 'bg-green-100 text-green-700',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Time-Based Menus',
      description: 'Automatically switch between breakfast, lunch, and dinner menus based on time.',
      color: 'bg-purple-100 text-purple-700',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime. Your data is always protected.',
      color: 'bg-red-100 text-red-700',
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-orange-100 text-orange-700 mb-4">Features</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Manage Your Menu
          </h2>
          <p className="text-lg text-gray-600">
            Powerful features designed to help restaurants create beautiful digital menus 
            and deliver exceptional customer experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* See Features in Action CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={onOpenDemo}
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium hover:underline"
          >
            <MousePointer className="w-4 h-4" />
            See these features in action
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

// ============================================
// How It Works Section
// ============================================

const HowItWorksSection = ({ onOpenDemo }: { onOpenDemo: () => void }) => {
  const steps = [
    {
      number: '01',
      title: 'Create Your Restaurant',
      description: 'Sign up and set up your restaurant profile with branding, colors, and languages.',
    },
    {
      number: '02',
      title: 'Build Your Menu',
      description: 'Add categories and menu items with images, descriptions, prices, and dietary tags.',
    },
    {
      number: '03',
      title: 'Generate QR Codes',
      description: 'Create QR codes for tables, rooms, or general access. Download and print them.',
    },
    {
      number: '04',
      title: 'Customers Scan & Browse',
      description: 'Customers scan the QR code and instantly see your beautiful digital menu.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-green-100 text-green-700 mb-4">How It Works</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Get Started in Minutes
          </h2>
          <p className="text-lg text-gray-600">
            Setting up your digital menu is simple and straightforward. 
            No technical skills required.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-gray-200 mb-4">{step.number}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gray-200">
                  <ChevronRight className="w-5 h-5 text-gray-300 absolute -right-2 -top-2.5" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Interactive Preview CTA */}
        <div className="mt-16">
          <DemoPreviewCard onClick={onOpenDemo} />
        </div>
      </div>
    </section>
  );
};

// ============================================
// Pricing Section
// ============================================

const PricingSection = ({ onOpenDemo }: { onOpenDemo: () => void }) => {
  const plans = [
    {
      name: 'Starter',
      price: '$0',
      period: 'forever',
      description: 'Perfect for small cafes and food trucks just getting started.',
      features: [
        '1 Restaurant',
        'Up to 50 menu items',
        '3 QR codes',
        'Basic analytics',
        'Email support',
      ],
      cta: 'Get Started Free',
      popular: false,
    },
    {
      name: 'Professional',
      price: '$29',
      period: 'per month',
      description: 'Ideal for growing restaurants with multiple locations.',
      features: [
        '3 Restaurants',
        'Unlimited menu items',
        'Unlimited QR codes',
        'Advanced analytics',
        'Priority support',
        'Multi-language support',
        'Time-based menus',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: 'per month',
      description: 'For restaurant chains and large hospitality groups.',
      features: [
        'Unlimited restaurants',
        'Unlimited everything',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
        'White-label options',
        'API access',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-blue-100 text-blue-700 mb-4">Pricing</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-gray-600">
            Choose the plan that fits your business. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 ${
                plan.popular
                  ? 'bg-gray-900 text-white shadow-xl scale-105'
                  : 'bg-gray-50 text-gray-900 border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white px-4 py-1">Most Popular</Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className={plan.popular ? 'text-gray-400' : 'text-gray-500'}>
                    {plan.period}
                  </span>
                </div>
                <p className={`mt-2 text-sm ${plan.popular ? 'text-gray-400' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className={`w-5 h-5 ${plan.popular ? 'text-orange-400' : 'text-green-500'}`} />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {plan.cta}
                </Button>
                <button
                  onClick={onOpenDemo}
                  className={`w-full text-sm font-medium py-2 rounded-lg transition-colors ${
                    plan.popular 
                      ? 'text-gray-400 hover:text-white' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Try demo first
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// Testimonials Section
// ============================================

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "DynamicMenu transformed how we manage our menu. Updates that used to take hours now take seconds. Our customers love the digital experience!",
      author: "Maria Rodriguez",
      role: "Owner, Bella Vista Restaurant",
      rating: 5,
    },
    {
      quote: "The QR code system is brilliant. We've saved thousands on printing costs and can update prices instantly when ingredients fluctuate.",
      author: "James Chen",
      role: "Manager, Spice Garden",
      rating: 5,
    },
    {
      quote: "Best investment for our cafe. The analytics help us understand what customers love, and the multi-language support is perfect for tourists.",
      author: "Sophie Martin",
      role: "Owner, Le Petit Cafe",
      rating: 5,
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="bg-purple-100 text-purple-700 mb-4">Testimonials</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Loved by Restaurant Owners
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================
// CTA Section
// ============================================

const CTASection = () => {
  return (
    <section className="py-24 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to Transform Your Menu?
        </h2>
        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          Join thousands of restaurants already using DynamicMenu to create 
          beautiful digital experiences for their customers.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8">
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Link to="/demo">
            <Button variant="outline" size="lg" className="border-gray-600 text-white hover:bg-gray-800">
              <Smartphone className="w-5 h-5 mr-2" />
              Try Demo Menu
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          14-day free trial • No credit card required • Cancel anytime
        </p>
      </div>
    </section>
  );
};

// ============================================
// Footer
// ============================================

const Footer = ({ onOpenDemo }: { onOpenDemo: () => void }) => {
  const links = {
    Product: ['Features', 'Pricing', 'Integrations', 'Changelog', 'Roadmap'],
    Company: ['About', 'Blog', 'Careers', 'Press', 'Partners'],
    Resources: ['Documentation', 'Help Center', 'Community', 'Templates', 'Webinars'],
    Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <a href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DynamicMenu</span>
            </a>
            <p className="text-gray-600 mb-6 max-w-sm">
              The easiest way for restaurants to create beautiful dynamic QR menus 
              and update them instantly.
            </p>
            <button
              onClick={onOpenDemo}
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
            >
              <Play className="w-4 h-4" />
              Try the interactive demo
            </button>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="font-semibold text-gray-900 mb-4">{category}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} DynamicMenu. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-500 hover:text-gray-900 text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-500 hover:text-gray-900 text-sm">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============================================
// Main Landing Page
// ============================================

const LandingPage = () => {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasCompletedDemo, setHasCompletedDemo] = useState(false);

  // Track tour completion
  const handleDemoComplete = useCallback(() => {
    setHasCompletedDemo(true);
    // Store in localStorage for analytics
    localStorage.setItem('dm_tour_completed', 'true');
    localStorage.setItem('dm_tour_completed_at', new Date().toISOString());
  }, []);

  // Analytics tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Track page view
      console.log('[Analytics] Landing page viewed');
      
      // Check if user has seen demo before
      const hasSeenDemo = localStorage.getItem('dm_tour_completed');
      if (hasSeenDemo) {
        console.log('[Analytics] Returning visitor (completed demo)');
      }
    }
  }, []);

  // Exit intent detection
  useExitIntent(() => {
    // Only show exit intent if demo hasn't been completed and user has been on page > 5s
    if (!hasCompletedDemo && !isDemoOpen) {
      setTimeout(() => setShowExitIntent(true), 5000);
    }
  }, !hasCompletedDemo);

  const openDemo = useCallback(() => {
    setIsDemoOpen(true);
    console.log('[Analytics] Demo opened');
  }, []);

  const closeDemo = useCallback(() => {
    setIsDemoOpen(false);
    console.log('[Analytics] Demo closed');
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation onOpenDemo={openDemo} />
      <HeroSection onOpenDemo={openDemo} />
      <FeaturesSection onOpenDemo={openDemo} />
      <HowItWorksSection onOpenDemo={openDemo} />
      
      {/* Interactive Demo Section */}
      <DemoSection onOpenDemo={openDemo} />
      
      <PricingSection onOpenDemo={openDemo} />
      <TestimonialsSection />
      <CTASection />
      <Footer onOpenDemo={openDemo} />

      {/* Demo Modal */}
      <DemoModal
        isOpen={isDemoOpen}
        onClose={closeDemo}
        onComplete={handleDemoComplete}
      />

      {/* Exit Intent Modal */}
      <ExitIntentModal
        isOpen={showExitIntent}
        onClose={() => setShowExitIntent(false)}
        onStartDemo={() => {
          setShowExitIntent(false);
          setIsDemoOpen(true);
        }}
      />
    </div>
  );
};

export default LandingPage;
