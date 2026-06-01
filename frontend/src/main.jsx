import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// PrimeReact styles
import 'primereact/resources/themes/lara-light-blue/theme.css'; // theme
import 'primereact/resources/primereact.min.css'; // core css
import 'primeicons/primeicons.css'; // icons
import 'primeflex/primeflex.css'; // primeflex

import './index.css'; // custom global styles if any

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
