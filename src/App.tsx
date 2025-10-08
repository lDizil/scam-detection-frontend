import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';

interface User {
  id: string;
  email: string;
  name: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем localStorage при загрузке
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
      <Routes>
        {/* Лендинг - главная страница */}
        <Route 
          path="/" 
          element={<LandingPageWrapper />}
        />

        
        {/* Страница авторизации */}
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
        
        {/* Дашборд (защищенный маршрут) */}
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
      </Routes>
    </BrowserRouter>
  );
}

// Обёртка для LandingPage с навигацией
function LandingPageWrapper() {
  const navigate = useNavigate();
  const savedUser = localStorage.getItem('user');
  const isLoggedIn = !!savedUser;
  
  return (
    <LandingPage 
      onGetStarted={() => navigate(isLoggedIn ? '/dashboard' : '/auth')}
      isLoggedIn={isLoggedIn}
    />
  );
}


// Обёртка для AuthPage с навигацией
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
