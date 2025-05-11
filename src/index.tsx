import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import GridProvider from './context/GridProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <GridProvider>
      <App />
    </GridProvider>
  </React.StrictMode>
);

