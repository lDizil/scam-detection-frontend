import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Shield, ArrowLeft, Mail, Lock, User, AlertTriangle } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: { id: string; email: string; name: string }) => void;
  onBackToLanding: () => void;
}

export function AuthPage({ onLogin, onBackToLanding }: AuthPageProps) {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!loginData.email || !loginData.password) {
      setLoginError('Заполните все поля');
      return;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginData.email)) {
      setLoginError('Введите корректный email адрес');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('fraudDetectionUsers') || '[]');
      const user = users.find((u: any) => u.email === loginData.email && u.password === loginData.password);
      
      if (user) {
        onLogin({ id: user.id, email: user.email, name: user.name });
      } else {
        setLoginError('Неверный email или пароль');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    
    if (!registerData.name || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      setRegisterError('Заполните все поля');
      return;
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerData.email)) {
      setRegisterError('Введите корректный email адрес');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('Пароли не совпадают');
      return;
    }

    if (registerData.password.length < 6) {
      setRegisterError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('fraudDetectionUsers') || '[]');

      if (users.find((u: any) => u.email === registerData.email)) {
        setRegisterError('Пользователь с таким email уже существует');
        setIsLoading(false);
        return;
      }

      const newUser = {
        id: Date.now().toString(),
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem('fraudDetectionUsers', JSON.stringify(users));

      onLogin({ id: newUser.id, email: newUser.email, name: newUser.name });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <Button
            variant="ghost"
            onClick={onBackToLanding}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад
          </Button>
          
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-blue-500 p-2 rounded-xl">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <span className="text-3xl font-bold">FraudGuard AI</span>
          </div>
          <p className="text-gray-600 text-base">Войдите или зарегистрируйтесь</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardContent className="pt-8">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-50 p-1 rounded-xl mb-8 h-12">
                <TabsTrigger 
                  value="login"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-medium transition-all"
                >
                  Вход
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm font-medium transition-all"
                >
                  Регистрация
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-5">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium text-gray-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="login-email"
                        type="text"
                        placeholder="your@email.com"
                        className="pl-11 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        value={loginData.email}
                        onChange={(e) => {
                          setLoginData({ ...loginData, email: e.target.value });
                          setLoginError('');
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium text-gray-700">Пароль</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-11 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        value={loginData.password}
                        onChange={(e) => {
                          setLoginData({ ...loginData, password: e.target.value });
                          setLoginError('');
                        }}
                      />
                    </div>
                    {loginError && (
                      <p className="text-red-600 text-sm flex items-center mt-1">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                        {loginError}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center mt-6">
                    <Button 
                      type="submit" 
                      className="px-20 h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-sm rounded-lg" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Вход...' : 'Войти'}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register" className="space-y-5">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-sm font-medium text-gray-700">Имя</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Ваше имя"
                        className="pl-11 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        value={registerData.name}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, name: e.target.value });
                          setRegisterError('');
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="register-email"
                        type="text"
                        placeholder="your@email.com"
                        className="pl-11 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        value={registerData.email}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, email: e.target.value });
                          setRegisterError('');
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">Пароль</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-11 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        value={registerData.password}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, password: e.target.value });
                          setRegisterError('');
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-confirm" className="text-sm font-medium text-gray-700">Подтвердите пароль</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="••••••••"
                        className="pl-11 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        value={registerData.confirmPassword}
                        onChange={(e) => {
                          setRegisterData({ ...registerData, confirmPassword: e.target.value });
                          setRegisterError('');
                        }}
                      />
                    </div>
                    {registerError && (
                      <p className="text-red-600 text-sm flex items-center mt-1">
                        <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                        {registerError}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-center mt-6">
                    <Button 
                      type="submit" 
                      className="px-12 h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-sm rounded-lg" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          Создавая аккаунт, вы соглашаетесь с нашими условиями использования
        </p>
      </div>
    </div>
  );
}

