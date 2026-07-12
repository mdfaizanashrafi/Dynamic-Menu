import { useEffect, useState, createContext, useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth, User } from './api';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MenuBuilderPage from './pages/MenuBuilderPage';
import PublicMenuPage from './pages/PublicMenuPage';

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(localStorage.getItem('dm_token'));
  const [loading, setLoading] = useState(true);

  function setToken(token: string | null) {
    setTokenState(token);
    if (token) localStorage.setItem('dm_token', token);
    else localStorage.removeItem('dm_token');
  }

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    auth
      .me()
      .then(setUser)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken, loading }}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/builder"
          element={
            <PrivateRoute>
              <MenuBuilderPage />
            </PrivateRoute>
          }
        />
        <Route path="/m/:slug" element={<PublicMenuPage />} />
        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
