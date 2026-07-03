import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import RouterConfig from './navigation/RouterConfig';
import PasswordPopup from './components/PasswordPopup';
import { isAuthenticated, ensureAuthValid } from './utils/auth';
import { URLS } from './navigation/CONSTANTS';
import HomePage from './pages/homePage';
import './App.css';


function App() {
  // Forzar invalidación de tokens que no coincidan con la contraseña actual
  // (útil cuando cambias CORRECT_PASSWORD en el código)
  ensureAuthValid();
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  const handleAuthenticated = () => {
    setAuthenticated(true);
  };

  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        {!authenticated && <PasswordPopup onAuthenticated={handleAuthenticated} />}

        {authenticated ? (
          <RouterConfig />
        ) : (
          // Si no está autenticado, forzamos que todas las rutas vayan a la home
          <Routes>
            <Route path="/" element={<Navigate to={URLS.HOMEPAGE} replace />} />
            <Route path={URLS.HOMEPAGE} element={<HomePage />} />
            <Route path="*" element={<Navigate to={URLS.HOMEPAGE} replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}


export default App;
