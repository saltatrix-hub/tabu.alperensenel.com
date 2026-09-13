import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TabuApp from '../components/TabuApp';
import '../app/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode><TabuApp /></StrictMode>,
);
