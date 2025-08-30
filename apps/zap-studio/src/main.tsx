import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import "./assets/fonts/Geist/Geist-Regular.ttf";
import { App } from './App.tsx';
import { ThemeProvider } from './components/theme.provider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </StrictMode>
);
