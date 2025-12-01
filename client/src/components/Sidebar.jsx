import React, { useState } from 'react';
import { FaHome, FaBoxOpen, FaShoppingCart, FaChartLine, FaClipboardList, FaHistory, FaBars, FaTimes } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile Menu State
  const location = useLocation(); // Active Link Highlight karne ke liye

  // Helper to highlight active link
  const isActive = (path) => location.pathname === path ? "bg-blue-600 text-white shadow-lg" : "text-gray-300 hover:bg-gray-800 hover:text-white";

  return (
    <>
      {/* --- MOBILE HEADER (Sirf Mobile pe dikhega) --- */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center fixed top-0 w-full z-50 shadow-md">
        <span className="font-bold text-xl text-blue-400">MediStock 💊</span>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none">
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      <div className={`
        bg-gray-900 text-white h-screen fixed top-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:block
      `}>
        {/* Logo (Desktop) */}
        <div className="p-6 text-2xl font-bold text-blue-400 border-b border-gray-700 hidden md:block">
          MediStock 💊
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 mt-14 md:mt-0">
          <Link to="/" onClick={() => setIsOpen(false)} className={`flex items-center p-3 rounded-lg transition ${isActive('/')}`}>
            <FaHome className="mr-3" /> Dashboard
          </Link>
          
          <Link to="/inventory" onClick={() => setIsOpen(false)} className={`flex items-center p-3 rounded-lg transition ${isActive('/inventory')}`}>
            <FaBoxOpen className="mr-3" /> Inventory
          </Link>
          
          <Link to="/sales" onClick={() => setIsOpen(false)} className={`flex items-center p-3 rounded-lg transition ${isActive('/sales')}`}>
            <FaShoppingCart className="mr-3" /> New Sale
          </Link>

          <Link to="/history" onClick={() => setIsOpen(false)} className={`flex items-center p-3 rounded-lg transition ${isActive('/history')}`}>
            <FaHistory className="mr-3" /> Sales History
          </Link>

          <Link to="/demand" onClick={() => setIsOpen(false)} className={`flex items-center p-3 rounded-lg transition ${isActive('/demand')}`}>
            <FaClipboardList className="mr-3" /> Demand List
          </Link>
        </nav>

        {/* Footer (Optional) */}
        <div className="p-4 border-t border-gray-700 text-center text-xs text-gray-500">
          © 2024 developed by Indrajeet Kumar
        </div>
      </div>

      {/* Overlay (Mobile par sidebar khulne par background dhundhla kare) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;