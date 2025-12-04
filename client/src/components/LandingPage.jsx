import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaClinicMedical, FaChartLine, FaBoxOpen, FaFileInvoice, 
  FaArrowRight, FaSun, FaMoon 
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext'; // Use Global Context

const LandingPage = () => {
  const { isDarkMode, toggleTheme } = useTheme(); // Global State

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-500 selection:text-white`}>
      
      {/* NAVBAR */}
      <nav className={`flex justify-between items-center p-6 md:px-12 border-b relative z-50 transition-all duration-300
        ${isDarkMode 
          ? "glass-panel border-white/10" 
          : "bg-white/80 backdrop-blur-md border-gray-200 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-2">
          <FaClinicMedical className="text-3xl text-blue-500 animate-pulse" />
          <span className={`text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${isDarkMode ? "from-blue-400 to-purple-500" : "from-blue-600 to-purple-600"}`}>
            MediStock
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* THEME TOGGLE (GLOBAL) */}
          <button 
            onClick={toggleTheme} 
            className={`p-3 rounded-full transition-all duration-300 shadow-lg transform hover:scale-110
              ${isDarkMode 
                ? "bg-gray-800 text-yellow-400 hover:bg-gray-700 border border-gray-700" 
                : "bg-white text-orange-500 hover:bg-gray-50 border border-gray-200"
              }`}
          >
            {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>

          <Link to="/login" className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold hidden md:block">
            Login / Signup
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="flex flex-col items-center justify-center text-center px-4 mt-16 md:mt-24 mb-20 animate-fade-in relative z-10">
        <div className={`inline-block px-4 py-1 mb-4 rounded-full border text-sm font-semibold tracking-wider
          ${isDarkMode ? "bg-blue-900/30 border-blue-500/30 text-blue-300" : "bg-blue-100 border-blue-200 text-blue-700"}`}>
          🚀 Next Gen Pharmacy Management
        </div>
        <h1 className={`text-5xl md:text-7xl font-extrabold mb-6 leading-tight ${isDarkMode ? "text-white" : "text-gray-900"}`}>
          Manage Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Medical Store</span> <br /> Like a Pro.
        </h1>
        <p className={`text-lg md:text-xl max-w-2xl mb-8 leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Track inventory, generate bills, and analyze sales with a UI that adapts to your style.
        </p>
        
        <Link to="/login" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:scale-105 transition flex items-center justify-center gap-2 group">
          Get Started <FaArrowRight className="group-hover:translate-x-1 transition-transform"/>
        </Link>
      </div>

      {/* FEATURES GRID */}
      <div className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <FeatureCard isDarkMode={isDarkMode} icon={<FaBoxOpen />} title="Smart Inventory" desc="Real-time stock tracking with low-stock alerts." color="blue" />
        <FeatureCard isDarkMode={isDarkMode} icon={<FaFileInvoice />} title="Fast Billing" desc="Create PDF invoices in seconds with auto discounts." color="green" />
        <FeatureCard isDarkMode={isDarkMode} icon={<FaChartLine />} title="Sales Analytics" desc="Visual graphs and daily reports." color="purple" />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, color, isDarkMode }) => {
  const cardStyle = isDarkMode ? "glass-panel border-opacity-30" : "bg-white border border-gray-100 shadow-xl";
  const textColors = { blue: isDarkMode ? "text-blue-400" : "text-blue-600", green: isDarkMode ? "text-green-400" : "text-green-600", purple: isDarkMode ? "text-purple-400" : "text-purple-600" };

  return (
    <div className={`p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2 ${cardStyle}`}>
      <div className={`text-5xl mb-6 ${textColors[color]} drop-shadow-md`}>{icon}</div>
      <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}`}>{title}</h3>
      <p className={`leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>{desc}</p>
    </div>
  );
};

export default LandingPage;