import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

const host = document.getElementById('root');
if (!host) throw new Error('root container missing');

createRoot(host).render(
  <StrictMode>
    <App />
  </StrictMode>
);
