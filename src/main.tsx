import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ToastProvider } from './components/ui-bits';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/Common/ErrorBoundary';

// Global error handlers to capture runtime errors during boot
window.addEventListener('error', (e) => {
  // eslint-disable-next-line no-console
  console.error('GLOBAL ERROR:', e.error || e.message, e.error ? e.error.stack : '');
});
window.addEventListener('unhandledrejection', (e) => {
  // eslint-disable-next-line no-console
  console.error('UNHANDLED REJECTION:', e.reason);
});

console.log('MAIN: rendering full App');
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
