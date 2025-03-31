
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

// Call the element loader
defineCustomElements(window);

// Initialize the app
const startApp = () => {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    createRoot(rootElement).render(<App />);
  }
};

// Wait for the device to be ready when in native environments
document.addEventListener('DOMContentLoaded', () => {
  startApp();
});
