import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, QrCode, LogOut, ExternalLink } from 'lucide-react';
import { publicApi } from '../api';
import { useAuth } from '../App';

export default function DashboardPage() {
  const { user, setUser, setToken } = useAuth();
  const navigate = useNavigate();
  const [qr, setQr] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState('');

  useEffect(() => {
    if (!user) return;
    const url = `${window.location.origin}/m/${user.slug}`;
    setPublicUrl(url);
    publicApi
      .getQr(user.slug)
      .then(data => setQr(data.qrDataUrl))
      .catch(() => setQr(null));
  }, [user]);

  function logout() {
    setToken(null);
    setUser(null);
    navigate('/login');
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
            <UtensilsCrossed className="text-brand-500" size={24} />
            DynamicMenu
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-slate-500">{user.email}</span>
            <button
              onClick={logout}
              className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-sm font-medium"
            >
              <LogOut size={18} /> Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-brand-50 rounded-lg">
                <LayoutDashboard className="text-brand-600" size={22} />
              </div>
              <h2 className="text-lg font-semibold">Your restaurant</h2>
            </div>
            <p className="text-slate-700 font-medium text-lg">{user.restaurantName}</p>
            <p className="text-slate-500 text-sm mt-1">Public URL:</p>
            <a
              href={publicUrl}
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 hover:underline text-sm break-all flex items-center gap-1"
            >
              {publicUrl} <ExternalLink size={14} />
            </a>
            <div className="mt-6 flex gap-3">
              <Link
                to="/builder"
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                <UtensilsCrossed size={18} /> Edit menu
              </Link>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-medium"
              >
                <ExternalLink size={18} /> View menu
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-brand-50 rounded-lg">
                <QrCode className="text-brand-600" size={22} />
              </div>
              <h2 className="text-lg font-semibold">QR code</h2>
            </div>
            {qr ? (
              <div className="flex flex-col items-center">
                <img src={qr} alt="QR code" className="w-48 h-48 rounded-xl border border-slate-200" />
                <p className="text-xs text-slate-400 mt-3 text-center">Scan to open your public menu</p>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Generating QR code...</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
