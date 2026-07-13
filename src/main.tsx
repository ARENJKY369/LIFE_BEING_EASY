import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

// Remove initial HTML loader if present
const removeInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 300);
  }
}

// Global error handling to prevent white screen / stuck loading
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error || e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled rejection:', e.reason);
});

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element not found');
}

const root = createRoot(rootEl);
root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

// Hide initial loader after React mounts
setTimeout(removeInitialLoader, 200);

// Register PWA service worker with error handling - prevents stuck on old SW
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // vite-plugin-pwa auto registers, but we add cleanup for stale registrations
    navigator.serviceWorker.getRegistrations().then((regs) => {
      // If more than 1 registration, clean extras (can cause stuck)
      if (regs.length > 1) {
        console.log('Cleaning extra SW registrations');
        regs.slice(1).forEach(r => r.unregister());
      }
    });
  });
}
