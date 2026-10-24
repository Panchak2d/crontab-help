import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { applyTheme, getInitialTheme } from './utils/theme';

applyTheme(getInitialTheme());

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found in index.html');

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
