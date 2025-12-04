import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Import
import { ThemeProvider, useTheme } from './context/ThemeContext';

import Sidebar from './components/Sidebar';
import DashboardStats from './components/DashboardStats';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import SalesHistory from './components/SalesHistory';
import Demand from './components/Demand';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';

const MainApp = () => {
  const { isDarkMode } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = token;
    }
    setIsLoading(false);
  }, []);

  const handleLogin = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = token;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('storeName');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
  };

  if (isLoading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    // 'light-mode' class yahan add hoti hai, jo CSS ko trigger karegi
    <div className={isDarkMode ? 'dark-mode' : 'light-mode'}>
      <ToastContainer position="top-right" autoClose={3000} theme={isDarkMode ? "dark" : "light"} />

      {/* --- BACKGROUND FIX --- */}
      <div className={`fixed inset-0 -z-10 transition-colors duration-500 ease-in-out
        ${isDarkMode 
          ? "bg-gradient-to-br from-gray-900 via-black to-blue-900" 
          : "bg-gray-100" // Simple Light Gray background for better contrast
        }`}
      >
        {/* Blobs sirf Dark Mode mein dikhayein taaki Light mode clean rahe */}
        {isDarkMode && (
          <>
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
          </>
        )}
      </div>

      <Router>
        {!isAuthenticated ? (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Auth onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        ) : (
          <div className="flex flex-col md:flex-row min-h-screen font-sans">
            <div className="flex-none z-50">
              <Sidebar onLogout={handleLogout} />
            </div>
            <div className="flex-1 p-4 md:p-0 mt-16 md:mt-0 overflow-x-hidden relative">
              <Routes>
                <Route path="/" element={<DashboardStats />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/history" element={<SalesHistory />} />
                <Route path="/demand" element={<Demand />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
        )}
      </Router>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

export default App;