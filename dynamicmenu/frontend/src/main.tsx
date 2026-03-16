import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Log app startup
console.log('[DynamicMenu] Application starting...');

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('[DynamicMenu] Global error:', event.error);
  alert('Error: ' + event.error?.message);
});

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('[DynamicMenu] Unhandled promise rejection:', event.reason);
  alert('Promise Error: ' + event.reason);
});

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found!');
  }
  
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  
  console.log('[DynamicMenu] App rendered successfully');
} catch (error) {
  console.error('[DynamicMenu] Failed to render app:', error);
  document.body.innerHTML = `
    <div style="padding: 40px; font-family: sans-serif; color: red;">
      <h1>Failed to start application</h1>
      <pre>${error instanceof Error ? error.message : String(error)}</pre>
    </div>
  `;
}
