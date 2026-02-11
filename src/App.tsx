import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { Profile } from './components/Profile';
import { authApi } from './api/auth';

import type { User } from './api/auth';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authApi.checkAuth();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route 
          path="/" 
          element={<LandingPageWrapper user={user} />}
        />
        
        <Route 
          path="/auth" 
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthPageWrapper onLogin={handleLogin} />
            )
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />

        {/* Профиль (защищенный маршрут) */}
        <Route 
          path="/profile" 
          element={
            user ? (
              <Profile user={user} onUpdate={handleLogin} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

function LandingPageWrapper({ user }: { user: User | null }) {
  const navigate = useNavigate();
  const savedUser = localStorage.getItem('user');
  const isLoggedIn = !!user;
  
  let username: string | undefined;
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser);
      username = userData.username || userData.email;
    } catch (error) {
      console.error('Failed to parse user data:', error);
    }
  }
  
  return (
    <LandingPage 
      onGetStarted={() => navigate(isLoggedIn ? '/dashboard' : '/auth')}
      isLoggedIn={isLoggedIn}
      username={username}
    />
  );
}

function AuthPageWrapper({ onLogin }: { onLogin: (user: User) => void }) {
  const navigate = useNavigate();
  
  return (
    <AuthPage 
      onLogin={onLogin}
      onBackToLanding={() => navigate('/')}
    />
  );
}

export default App;
