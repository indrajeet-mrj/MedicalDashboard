import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardStats from './components/DashboardStats';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import SalesHistory from './components/SalesHistory';
import Demand from './components/Demand';

function App() {
  return (
    <Router>
      {/* Background ko Dark Gradient diya hai */}
      <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white font-sans selection:bg-blue-500 selection:text-white">
        
        <div className="flex-none z-50">
          <Sidebar />
        </div>
        
        <div className="flex-1 p-4 md:p-0 mt-16 md:mt-0 overflow-x-hidden relative">
          {/* Background decoration (Glowing orbs) */}
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
          </Routes>
        </div>

      </div>
    </Router>
  );
}

export default App;