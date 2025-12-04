import React, { useState, useEffect } from 'react';
import { 
  FaHome, FaBoxOpen, FaShoppingCart, FaClipboardList, 
  FaHistory, FaBars, FaTimes, FaSignOutAlt, FaClinicMedical,
  FaSun, FaMoon // <-- Icons Import Kiye
} from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext'; // <-- Context Import Kiya

const Sidebar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [storeName, setStoreName] = useState('MediStock');
  
  // --- THEME CONTEXT ---
  const { isDarkMode, toggleTheme } = useTheme(); // Theme Hook use kiya

  useEffect(() => {
    const name = localStorage.getItem('storeName');
    if (name) setStoreName(name);
  }, []);

  const isActive = (path) => location.pathname === path 
    ? "bg-blue-600/20 border-l-4 border-blue-500 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
    : "text-gray-400 hover:bg-black/10 hover:text-blue-500 transition-all"; // Light mode friendly text

  const menuItems = [
    { path: "/", name: "Dashboard", icon: <FaHome size={20} /> },
    { path: "/inventory", name: "Inventory", icon: <FaBoxOpen size={20} /> },
    { path: "/sales", name: "New Sale", icon: <FaShoppingCart size={20} /> },
    { path: "/history", name: "Sales History", icon: <FaHistory size={20} /> },
    { path: "/demand", name: "Demand List", icon: <FaClipboardList size={20} /> },
  ];

  return (
    <>
      {/* --- MOBILE HEADER --- */}
      <div className={`md:hidden p-4 flex justify-between items-center fixed top-0 w-full z-50 shadow-lg border-b transition-colors duration-300
        ${isDarkMode ? "glass-panel border-white/10" : "bg-white border-gray-200"}`}>
        
        <div className="flex items-center gap-2">
          <FaClinicMedical className="text-blue-500 animate-pulse"/>
          <span className={`font-bold text-lg tracking-wider ${isDarkMode ? "text-white" : "text-gray-900"}`}>
            {storeName}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Mobile Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className={`p-2 rounded-full transition ${isDarkMode ? "text-yellow-400 bg-gray-800" : "text-orange-500 bg-gray-100 border border-gray-300"}`}
          >
            {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>

          <button onClick={() => setIsOpen(!isOpen)} className={`${isDarkMode ? "text-white" : "text-gray-900"} focus:outline-none`}>
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>

      {/* --- SIDEBAR CONTAINER --- */}
      <div className={`
        h-screen fixed top-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out flex flex-col border-r
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:block
        ${isDarkMode ? "glass-panel border-white/10" : "bg-white border-gray-200 shadow-xl"} 
      `}>
        
        {/* LOGO AREA */}
        <div className={`p-8 text-center border-b relative overflow-hidden ${isDarkMode ? "border-white/10" : "border-gray-200"}`}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
          <h1 className="text-xl font-extrabold tracking-widest flex flex-col items-center">
            <FaClinicMedical className="text-4xl text-blue-500 mb-2 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"/>
            <span className={`break-words w-full ${isDarkMode ? "text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-white" : "text-gray-800"}`}>
              {storeName}
            </span>
          </h1>
        </div>

        {/* NAVIGATION */}
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

        {/* --- FOOTER (Theme Toggle + Logout) --- */}
        <div className={`p-4 border-t ${isDarkMode ? "border-white/10 bg-black/20" : "border-gray-200 bg-gray-50"}`}>
          
          {/* THEME TOGGLE BUTTON (Desktop) */}
          <button 
            onClick={toggleTheme} 
            className={`w-full flex items-center justify-center p-3 rounded-lg mb-3 transition-all duration-300 border group
              ${isDarkMode 
                ? "bg-gray-800 text-yellow-400 hover:bg-gray-700 border-gray-700" 
                : "bg-white text-gray-700 hover:bg-gray-200 border-gray-300 shadow-sm"
              }`}
          >
            {isDarkMode ? <FaSun className="mr-2" /> : <FaMoon className="mr-2" />}
            <span className="font-bold">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
          </button>

          {/* LOGOUT BUTTON */}
          <button 
            onClick={onLogout} 
            className="w-full flex items-center justify-center p-3 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-300 border border-red-600/30 hover:border-red-600 group"
          >
            <FaSignOutAlt className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
            Logout
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsOpen(false)}></div>
      )}
    </>
  );
};

export default Sidebar;