import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Shield, Brain, CheckCircle, Lock, User as UserIcon } from 'lucide-react';
import { ImageWithFallback } from './common/ImageWithFallback';
import { Link, useNavigate } from 'react-router-dom';

interface LandingPageProps {
  onGetStarted: () => void;
  isLoggedIn?: boolean;
  username?: string;
}

export function LandingPage({ onGetStarted, isLoggedIn, username }: LandingPageProps) {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold">FraudGuard AI</span>
          </Link>
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              {username && (
                <span className="text-gray-600 text-base">
                  Добро пожаловать, <span className="font-semibold text-gray-900">{username}</span>
                </span>
              )}
              <Button 
                onClick={() => navigate('/profile')} 
                variant="outline" 
                className="text-base px-5 py-2 h-auto"
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Профиль
              </Button>
              <Button 
                onClick={onGetStarted} 
                variant="outline" 
                className="text-base px-5 py-2 h-auto"
              >
                Панель управления
              </Button>
            </div>
          ) : (
            <Button onClick={onGetStarted} variant="outline" className="text-base px-6 py-2 h-auto">
              Вход / Регистрация
            </Button>
          )}
        </div>
      </header>


      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Защитите себя от мошенничества с помощью ИИ
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Наша передовая нейронная сеть анализирует контент в режиме реального времени 
            и определяет потенциально мошеннические материалы с точностью более 95%
          </p>
          <div className="flex justify-center mb-12">
            <ImageWithFallback
              src="/images/scammer.jpg"
              alt="Fraud Detection Illustration"
              className="rounded-2xl shadow-2xl max-w-2xl mx-auto"
            />
          </div>
         <Button 
            onClick={onGetStarted} 
            size="lg"
            className="px-8 py-3 text-lg bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoggedIn ? 'В панель управления' : 'Начать защищаться'}
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl text-center mb-12">
            Почему выбирают FraudGuard AI?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                  <span>ИИ-анализ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Передовые алгоритмы машинного обучения анализируют текст, изображения 
                  и видео для выявления признаков мошенничества
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span>Высокая точность</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Более 95% точности определения мошеннического контента 
                  благодаря постоянному обучению на новых данных
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-6 w-6 text-purple-600" />
                  <span>Безопасность</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Все данные шифруются и обрабатываются в соответствии 
                  с международными стандартами безопасности
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl mb-12">Наши результаты</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl text-blue-600 mb-2">10,000+</div>
              <p className="text-gray-600">Проанализированных материалов</p>
            </div>
            <div>
              <div className="text-4xl text-green-600 mb-2">95.7%</div>
              <p className="text-gray-600">Точность определения</p>
            </div>
            <div>
              <div className="text-4xl text-purple-600 mb-2">2,500+</div>
              <p className="text-gray-600">Довольных пользователей</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl mb-6">
            {isLoggedIn ? 'Продолжайте защищать себя от мошенников' : 'Готовы защитить себя от мошенников?'}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {isLoggedIn 
              ? 'Используйте нашу панель управления для анализа контента и просмотра истории проверок'
              : 'Присоединяйтесь к тысячам пользователей, которые уже используют FraudGuard AI для защиты от мошеннического контента'
            }
          </p>
          <Button 
            onClick={onGetStarted}
            size="lg"
            className="px-8 py-3 text-lg bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-lg"
          >
            {isLoggedIn ? 'Перейти в панель управления' : 'Зарегистрироваться бесплатно'}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6" />
            <span className="text-xl">FraudGuard AI</span>
          </div>
          <p className="text-gray-400">
            © 2025 FraudGuard AI. Защита от мошенничества с помощью искусственного интеллекта.
          </p>
        </div>
      </footer>
    </div>
  );
}

