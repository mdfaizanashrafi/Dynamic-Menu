/**
 * DynamicMenu Frontend Application
 * Main entry point with routing
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

// Pages
import LandingPage from '@/pages/LandingPage';
import MenuPage from '@/pages/MenuPage';
import DemoMenuPage from '@/pages/DemoMenuPage';
import DashboardPage from '@/pages/DashboardPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';

// Context
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Customer Menu Routes */}
            <Route path="/menu/:slug" element={<MenuPage />} />
            <Route path="/demo" element={<DemoMenuPage />} />
            
            {/* Dashboard Routes */}
            <Route path="/dashboard/*" element={<DashboardPage />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </AuthProvider>
    </TooltipProvider>
  );
}

export default App;
