/**
 * Register Page
 * User registration with freemium plan messaging
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Check, 
  Star, 
  Building2, 
  Utensils, 
  QrCode, 
  BarChart3, 
  Palette,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useAuth, type RegisterData } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';

// Plan features
const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    icon: Star,
    features: [
      '1 Restaurant',
      'Unlimited menu items',
      'Unlimited QR codes',
      'Basic analytics',
      'Custom branding',
      'Email support',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Best for growing businesses',
    icon: Building2,
    features: [
      'Up to 5 Restaurants',
      'Unlimited menu items',
      'Unlimited QR codes',
      'Advanced analytics',
      'Custom branding',
      'Priority support',
      'API access',
      'Remove branding',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large restaurant chains',
    icon: Building2,
    features: [
      'Unlimited Restaurants',
      'Unlimited everything',
      'Enterprise analytics',
      'White-label option',
      '24/7 Dedicated support',
      'Full API access',
      'Custom integrations',
      'Account manager',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">DynamicMenu</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Start with our free plan - 1 menu, forever free
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Create Your Digital Menu in{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              Minutes
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Join thousands of restaurants using DynamicMenu to create beautiful, 
            QR-code based menus that your customers will love.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Registration Form */}
          <div>
            <Card className="shadow-xl border-0">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
                <CardDescription>
                  Get started with your free restaurant menu
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@restaurant.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="h-11"
                    />
                    <p className="text-xs text-muted-foreground">
                      Must be at least 8 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold"
                    disabled={isLoading}
                  >n                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Get Started Free
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                <Separator className="my-6" />

                <p className="text-xs text-center text-muted-foreground">
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className="text-orange-600 hover:underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-orange-600 hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </CardContent>
            </Card>

            {/* Free Plan Highlight */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Free Plan Includes:</h3>
                  <ul className="mt-2 space-y-1 text-sm text-green-800">
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3" /> 1 Restaurant forever
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3" /> Unlimited menu items
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3" /> Unlimited QR codes
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3 h-3" /> No credit card required
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Comparison */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Choose Your Plan</h2>
            
            <div className="space-y-4">
              {PLANS.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${
                    plan.popular
                      ? 'border-orange-500 ring-1 ring-orange-500'
                      : 'border-border'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-orange-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          plan.popular
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <plan.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{plan.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {plan.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{plan.price}</div>
                        <div className="text-sm text-muted-foreground">{plan.period}</div>
                      </div>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <Check className={`w-4 h-4 ${plan.popular ? 'text-orange-500' : 'text-green-500'}`} />
                          {feature}
                        </li>
                      ))}
                      {plan.features.length > 4 && (
                        <li className="text-sm text-muted-foreground pl-6">
                          +{plan.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Feature Icons */}
            <div className="grid grid-cols-4 gap-4 pt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <QrCode className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium">QR Codes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Utensils className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium">Menu Editor</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium">Analytics</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Palette className="w-6 h-6" />
                </div>
                <p className="text-xs font-medium">Branding</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
