import React, { useState } from 'react';
import { 
  FaHome, FaBoxOpen, FaShoppingCart, FaClipboardList, 
  FaHistory, FaBars, FaTimes, FaSignOutAlt, FaClinicMedical 
} from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

// Note: onLogout prop receive kiya hai App.jsx se
const Sidebar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Active Link Style (Neon Glow)
  const isActive = (path) => location.pathname === path 
    ? "bg-blue-600/20 border-l-4 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
    : "text-gray-400 hover:bg-white/5 hover:text-white transition-all";

  // Navigation Links Data
  const menuItems = [
    { path: "/", name: "Dashboard", icon: <FaHome size={20} /> },
    { path: "/inventory", name: "Inventory", icon: <FaBoxOpen size={20} /> },
    { path: "/sales", name: "New Sale", icon: <FaShoppingCart size={20} /> },
    { path: "/history", name: "Sales History", icon: <FaHistory size={20} /> },
    { path: "/demand", name: "Demand List", icon: <FaClipboardList size={20} /> },
  ];

  return (
    <>
      {/* --- MOBILE HEADER (Visible only on small screens) --- */}
      <div className="md:hidden glass-panel text-white p-4 flex justify-between items-center fixed top-0 w-full z-50 shadow-lg border-b border-white/10">
        <div className="flex items-center gap-2">
          <FaClinicMedical className="text-blue-500 animate-pulse"/>
          <span className="font-bold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            AIR Medical
          </span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none hover:text-blue-400 transition">
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* --- SIDEBAR CONTAINER --- */}
      <div className={`
        glass-panel h-screen fixed top-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:block border-r border-white/10
      `}>
        
        {/* LOGO SECTION */}
        <div className="p-8 text-center border-b border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
          <h1 className="text-2xl font-extrabold tracking-widest flex flex-col items-center">
            <FaClinicMedical className="text-4xl text-blue-500 mb-2 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"/>
            <span className="text-white">AIR <span className="text-blue-500">Medical</span></span>
          </h1>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 p-4 space-y-3 mt-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              onClick={() => setIsOpen(false)} 
              className={`flex items-center p-3 rounded-r-lg transition-all duration-300 font-medium ${isActive(item.path)}`}
            >
              <span className="mr-3">{item.icon}</span> 
              {item.name}
            </Link>
          ))}
        </nav>

        {/* FOOTER & LOGOUT */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center justify-center p-3 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-300 border border-red-600/30 hover:border-red-600 group"
          >
            <FaSignOutAlt className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Logout
          </button>
          
          <div className="mt-4 text-center text-[10px] text-gray-500 uppercase tracking-widest">
            System Online <span className="text-green-500 animate-pulse">●</span>
          </div>
        </div>
      </div>

      {/* MOBILE OVERLAY (Click outside to close) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;