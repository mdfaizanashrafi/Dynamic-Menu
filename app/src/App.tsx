/**
 * DynamicMenu App
 * Main application component with routing
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/register" replace />;
  }

  return <>{children}</>;
};

// Public route wrapper (redirects to dashboard if already authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// App routes
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      
      {/* Login Page */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Placeholder routes for other pages */}
      <Route
        path="/restaurants/:id"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Restaurant Details</h1>
                <p className="text-muted-foreground">Coming soon...</p>
                <a href="/dashboard" className="text-orange-600 hover:underline mt-4 block">
                  Back to Dashboard
                </a>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/menus"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Menus</h1>
                <p className="text-muted-foreground">Coming soon...</p>
                <a href="/dashboard" className="text-orange-600 hover:underline mt-4 block">
                  Back to Dashboard
                </a>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/qr-codes"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">QR Codes</h1>
                <p className="text-muted-foreground">Coming soon...</p>
                <a href="/dashboard" className="text-orange-600 hover:underline mt-4 block">
                  Back to Dashboard
                </a>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Analytics</h1>
                <p className="text-muted-foreground">Coming soon...</p>
                <a href="/dashboard" className="text-orange-600 hover:underline mt-4 block">
                  Back to Dashboard
                </a>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Settings</h1>
                <p className="text-muted-foreground">Coming soon...</p>
                <a href="/dashboard" className="text-orange-600 hover:underline mt-4 block">
                  Back to Dashboard
                </a>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/upgrade"
        element={
          <ProtectedRoute>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Upgrade Plan</h1>
                <p className="text-muted-foreground">Coming soon...</p>
                <a href="/dashboard" className="text-orange-600 hover:underline mt-4 block">
                  Back to Dashboard
                </a>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

// Main App component
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
