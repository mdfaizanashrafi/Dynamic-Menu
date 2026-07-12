import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../api';
import { useAuth } from '../App';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { setUser, setToken } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await auth.login({ email, password });
      setToken(data.token);
      setUser(data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="text-slate-500 mt-1">Sign in to manage your menu</p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
