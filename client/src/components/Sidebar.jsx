import React, { useState } from 'react';
import { FaHome, FaBoxOpen, FaShoppingCart, FaChartLine, FaClipboardList, FaHistory, FaBars, FaTimes } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Active Link with Neon Effect
  const isActive = (path) => location.pathname === path 
    ? "bg-blue-600/20 border-l-4 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
    : "text-gray-400 hover:bg-white/5 hover:text-white transition-all";

  return (
    <>
      {/* Mobile Header (Glass) */}
      <div className="md:hidden glass-panel text-white p-4 flex justify-between items-center fixed top-0 w-full z-50 shadow-lg">
        <span className="font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">MediStock ⚡</span>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Sidebar Panel (Glass) */}
      <div className={`
        glass-panel h-screen fixed top-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:block border-r border-white/10
      `}>
        <div className="p-8 text-2xl font-extrabold tracking-widest text-center border-b border-white/10">
          <span className="text-blue-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]">Medi</span>
          <span className="text-white">Stock</span>
        </div>

        <nav className="flex-1 p-4 space-y-4 mt-14 md:mt-0">
          <Link to="/" onClick={() => setIsOpen(false)} className={`flex items-center p-3 rounded-r-lg transition-all duration-300 ${isActive('/')}`}>
            <FaHome className="mr-3 text-xl" /> Dashboard
          </Link>
          
          <Link to="/inventory" onClick={() => setIsOpen(false)} className={`flex items-center p-3 rounded-r-lg transition-all duration-300 ${isActive('/inventory')}`}>
            <FaBoxOpen className="mr-3 text-xl" /> Inventory
          </Link>
          
          <Link to="/sales" onClick={() => setIsOpen(false)} className={`flex items-center p-3 rounded-r-lg transition-all duration-300 ${isActive('/sales')}`}>
            <FaShoppingCart className="mr-3 text-xl" /> New Sale
          </Link>

          <Link to="/history" onClick={() => setIsOpen(false)} className={`flex items-center p-3 rounded-r-lg transition-all duration-300 ${isActive('/history')}`}>
            <FaHistory className="mr-3 text-xl" /> History
          </Link>

          <Link to="/demand" onClick={() => setIsOpen(false)} className={`flex items-center p-3 rounded-r-lg transition-all duration-300 ${isActive('/demand')}`}>
            <FaClipboardList className="mr-3 text-xl" /> Demand List
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10 text-center text-xs text-gray-500">
          SYSTEM STATUS: <span className="text-green-400 animate-pulse">● ONLINE</span>
        </div>
      </div>

      {isOpen && <div className="fixed inset-0 bg-black/80 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;