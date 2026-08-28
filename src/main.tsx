import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import KasappLanding from './Kasapp2Landing';
import PaymentSuccess from './PaymentSuccess';
import './index.css';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<KasappLanding />} />
        <Route path="/success" element={<PaymentSuccess />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>
);


