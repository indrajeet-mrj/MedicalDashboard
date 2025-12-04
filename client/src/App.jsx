import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import DashboardStats from './components/DashboardStats';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import SalesHistory from './components/SalesHistory';
import Demand from './components/Demand';
import Auth from './components/Auth'; // New Component

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on load
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // Set Default Header for all Axios requests
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

  // Agar login nahi hai, to Auth page dikhao
  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  // Agar login hai, to Dashboard dikhao
  return (
    <Router>
      <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white font-sans selection:bg-blue-500 selection:text-white">
        
        <div className="flex-none z-50">
          <Sidebar onLogout={handleLogout} /> {/* Pass logout function to sidebar */}
        </div>
        
        <div className="flex-1 p-4 md:p-0 mt-16 md:mt-0 overflow-x-hidden relative">
          {/* Background decoration */}
          <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
          </div>

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
    </Router>
  );
}

export default App;