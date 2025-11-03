# 🛡️ FraudGuard AI# React + TypeScript + Vite

Web-приложение для анализа контента на предмет мошенничества с использованием искусственного интеллекта.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## 📋 О проектеCurrently, two official plugins are available:

FraudGuard AI — это интеллектуальная система для обнаружения и анализа мошеннического контента. Приложение позволяет пользователям проверять тексты, изображения, видео и URL-адреса на наличие признаков мошенничества, используя передовые алгоритмы машинного обучения.- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh

- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

### Основные возможности:

## React Compiler

- 🔍 **Анализ контента**: Проверка текстов, изображений, видео и URL на мошенничество

- 📊 **Детальная статистика**: Оценка рисков и подробный отчет по каждому анализуThe React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

- 📜 **История анализов**: Сохранение и просмотр результатов предыдущих проверок

- 👤 **Личный кабинет**: Управление профилем и историей анализов## Expanding the ESLint configuration

- 🔐 **Безопасная авторизация**: JWT токены в HttpOnly cookies

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

## 🚀 Технологии

````js

- **React 18** + **TypeScript** — современный UIexport default defineConfig([

- **Vite** — быстрая сборка и разработка  globalIgnores(['dist']),

- **Tailwind CSS** — стилизация  {

- **Axios** — HTTP клиент с автоматическим refresh токенов    files: ['**/*.{ts,tsx}'],

- **React Router** — маршрутизация    extends: [

- **Lucide React** — иконки



## 🛠️ Установка и запуск

      tseslint.configs.recommendedTypeChecked,

### Требования:

- Node.js 18+      tseslint.configs.strictTypeChecked,

- npm или yarn

- Go бэкенд (запущен на `http://localhost:8080`)      tseslint.configs.stylisticTypeChecked,



### Шаги:

    ],

1. **Клонировать репозиторий**    languageOptions: {

```bash      parserOptions: {

git clone https://github.com/lDizil/scam-detection-frontend.git        project: ['./tsconfig.node.json', './tsconfig.app.json'],

cd scam-detection-frontend        tsconfigRootDir: import.meta.dirname,

```      },


2. **Установить зависимости**    },

```bash  },

npm install])

````

3. **Настроить переменные окружения**You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

Файл `.env` уже создан с настройками:```js

````env// eslint.config.js

VITE_API_URL=http://localhost:8080/api/v1import reactX from 'eslint-plugin-react-x'

```import reactDom from 'eslint-plugin-react-dom'



4. **Запустить приложение**export default defineConfig([

```bash  globalIgnores(['dist']),

npm run dev  {

```    files: ['**/*.{ts,tsx}'],

    extends: [

Приложение откроется на `http://localhost:5173`      // Other configs...

      // Enable lint rules for React

## 📁 Структура проекта      reactX.configs['recommended-typescript'],

      // Enable lint rules for React DOM

```      reactDom.configs.recommended,

src/    ],

├── api/              # API клиент и методы    languageOptions: {

│   ├── client.ts     # Axios конфигурация с interceptors      parserOptions: {

│   ├── auth.ts       # Методы авторизации        project: ['./tsconfig.node.json', './tsconfig.app.json'],

│   └── content.ts    # Методы анализа контента        tsconfigRootDir: import.meta.dirname,

├── components/       # React компоненты      },

│   ├── AuthPage.tsx         # Страница авторизации      // other options...

│   ├── Dashboard.tsx        # Главная панель    },

│   ├── LandingPage.tsx      # Лендинг  },

│   ├── ContentAnalyzer.tsx  # Анализатор контента])

│   ├── AnalysisHistory.tsx  # История анализов```

│   └── ui/                  # UI компоненты
└── App.tsx           # Главный компонент с роутингом
````

## 🔐 Авторизация

### Регистрация:

- **Имя пользователя** (обязательно, минимум 3 символа)
- **Email** (необязательно)
- **Пароль** (обязательно, минимум 6 символов)

### Вход:

- **Имя пользователя**
- **Пароль**

JWT токены автоматически сохраняются в HttpOnly cookies и обновляются при необходимости.

## 📦 Основные команды

```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для продакшена
npm run preview      # Предпросмотр production сборки
npm run lint         # Проверка кода ESLint
```

## 🌐 API Integration

Приложение интегрировано с Go бэкендом через REST API:

- `POST /auth/register` — Регистрация
- `POST /auth/login` — Вход
- `POST /auth/logout` — Выход
- `POST /auth/refresh` — Обновление токенов
- `GET /profile` — Получение профиля
- `PUT /profile` — Обновление профиля
- `DELETE /account` — Удаление аккаунта

Swagger документация: `http://localhost:8080/swagger/index.html`

## 🎨 UI/UX Features

- Современный минималистичный дизайн
- Адаптивная верстка
- Плавные анимации и переходы
- Интуитивно понятный интерфейс
- Визуальная обратная связь для всех действий

## 📝 Лицензия

MIT

## 👨‍💻 Автор

[@lDizil](https://github.com/lDizil)
