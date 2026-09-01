import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PQRForm from './components/PQRForm';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { Moon, Sun } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Load user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('disproel_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('disproel_token');
    localStorage.removeItem('disproel_user');
    setUser(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Theme Toggle (Visible everywhere, hidden in print) */}
        <div className="no-print" style={{
          background: 'var(--text-main)',
          color: 'white',
          padding: '0.5rem 1.5rem',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          fontSize: '0.8125rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              onClick={toggleDarkMode} 
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span>{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </button>
            <span style={{ opacity: 0.5 }}>|</span>
            <span>Plataforma Disproel S.A.S.</span>
          </div>
        </div>

        {/* Main Content Render */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            {/* Client View */}
            <Route path="/" element={
              <div>
                {/* Elegant Banner for Client Page */}
                <div className="no-print" style={{
                  background: 'linear-gradient(135deg, #1e3a8a, #0f172a)',
                  color: 'white',
                  padding: '4rem 1.5rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {/* Logo - The user uploaded logoblanco.png */}
                  <img 
                    src="/images/logoblanco.png" 
                    alt="Disproel Logo" 
                    style={{ height: '80px', marginBottom: '1.5rem', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <p style={{ fontSize: '1.1rem', color: '#cbd5e1', maxWidth: '650px', margin: '0 auto', lineHeight: '1.6' }}>
                    Bienvenido al portal de radicación de PQRS y Garantías. Por favor complete el siguiente formato con los datos de su factura.
                  </p>
                </div>
                <PQRForm />
              </div>
            } />

            {/* Admin View */}
            <Route path="/admin" element={
              user ? (
                <AdminDashboard currentUser={user} onLogout={handleLogout} />
              ) : (
                <Login onLoginSuccess={(u) => setUser(u)} />
              )
            } />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
