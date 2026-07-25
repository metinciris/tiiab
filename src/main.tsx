import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Eski sürümlerdeki service worker yeni deployları önbellekten gösterebiliyordu.
// Uygulama yerel verileri localStorage'da tuttuğu için service worker gerekli değil.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => void registration.unregister());
    }).catch(() => undefined);
  });
}
