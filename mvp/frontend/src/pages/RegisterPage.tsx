import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../api';
import { useAuth } from '../App';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [restaurantName, setRestaurantName] = useState('');
  const [slug, setSlug] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { setUser, setToken } = useAuth();
  const navigate = useNavigate();

  function handleSlugChange(value: string) {
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 50));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await auth.register({ email, password, restaurantName, slug });
      setToken(data.token);
      setUser(data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-slate-500 mt-1">Start building your digital menu</p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Restaurant name</label>
            <input
              type="text"
              required
              value={restaurantName}
              onChange={e => setRestaurantName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
              placeholder="Burger House"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Menu URL slug</label>
            <div className="flex items-center rounded-lg border border-slate-300 px-3 bg-slate-50">
              <span className="text-slate-400 text-sm mr-1">/m/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={e => handleSlugChange(e.target.value)}
                className="flex-1 bg-transparent py-2 focus:ring-0"
                placeholder="burger-house"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Letters, numbers, and hyphens only.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
              placeholder="you@restaurant.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2.5 rounded-lg disabled:opacity-60"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
