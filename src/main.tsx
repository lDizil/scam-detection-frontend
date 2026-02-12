import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')!;

// Удалить loading skeleton после монтирования React
const removeSkeleton = () => {
  const skeleton = rootElement.querySelector('div[style*="position: fixed"]');
  if (skeleton) {
    skeleton.remove();
  }
};

createRoot(rootElement).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>,
)

// Удалить skeleton после рендера
setTimeout(removeSkeleton, 0);

