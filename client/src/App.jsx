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
      {/* Flex Container: Desktop par side-by-side, Mobile par upar-neeche */}
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
        
        {/* Sidebar */}
        <div className="flex-none">
          <Sidebar />
        </div>
        
        {/* Main Content Area */}
        {/* 'mt-16' mobile par header ke liye jagah banayega */}
        <div className="flex-1 p-4 md:p-0 mt-16 md:mt-0 overflow-x-hidden">
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