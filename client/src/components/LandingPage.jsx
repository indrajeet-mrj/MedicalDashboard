import React from 'react';
import { Link } from 'react-router-dom';
import { FaClinicMedical, FaChartLine, FaBoxOpen, FaFileInvoice, FaArrowRight } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900 text-white font-sans selection:bg-blue-500 selection:text-white overflow-hidden relative">
      
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="flex justify-between items-center p-6 md:px-12 glass-panel border-b border-white/10 relative z-50">
        <div className="flex items-center gap-2">
          <FaClinicMedical className="text-3xl text-blue-500 animate-pulse" />
          <span className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            MediStock
          </span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="px-6 py-2 rounded-full border border-blue-500/50 text-blue-300 hover:bg-blue-500/10 transition font-medium">
            Login
          </Link>
          <Link to="/login" className="px-6 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_15px_#2563eb] transition font-bold hidden md:block">
            Get Started
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="flex flex-col items-center justify-center text-center px-4 mt-16 md:mt-24 mb-20 animate-fade-in relative z-10">
        <div className="inline-block px-4 py-1 mb-4 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-300 text-sm font-semibold tracking-wider">
          🚀 Next Gen Pharmacy Management
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          Manage Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Medical Store</span> <br /> Like a Pro.
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
          MediStock is an advanced, all-in-one dashboard to track inventory, generate bills, manage returns, and analyze sales with a futuristic Neon UI.
        </p>
        
        <div className="flex flex-col md:flex-row gap-6">
          <Link to="/login" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:scale-105 transition flex items-center justify-center gap-2 group">
            Start Your Free Account <FaArrowRight className="group-hover:translate-x-1 transition-transform"/>
          </Link>
        </div>
      </div>

      {/* --- FEATURES GRID --- */}
      <div className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        <FeatureCard 
          icon={<FaBoxOpen />} 
          title="Smart Inventory" 
          desc="Real-time stock tracking with low-stock alerts and expiry management. Never run out of medicine."
          color="blue"
        />
        <FeatureCard 
          icon={<FaFileInvoice />} 
          title="Fast Billing" 
          desc="Create PDF invoices in seconds. Auto-calculate discounts and maintain patient history."
          color="green"
        />
        <FeatureCard 
          icon={<FaChartLine />} 
          title="Sales Analytics" 
          desc="Visual graphs and daily reports to understand your business growth and profits."
          color="purple"
        />
      </div>

      {/* --- FOOTER --- */}
      <footer className="text-center py-8 text-gray-500 text-sm border-t border-white/10 bg-black/20">
        <p>© 2024 MediStock. Designed for Medical Professionals.</p>
      </footer>
    </div>
  );
};

// Simple Feature Card Component
const FeatureCard = ({ icon, title, desc, color }) => {
  const colors = {
    blue: "text-blue-400 border-blue-500/30 shadow-blue-500/20",
    green: "text-green-400 border-green-500/30 shadow-green-500/20",
    purple: "text-purple-400 border-purple-500/30 shadow-purple-500/20",
  };

  return (
    <div className={`glass-panel p-8 rounded-2xl border ${colors[color].split(' ')[1]} hover:-translate-y-2 transition-transform duration-300 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]`}>
      <div className={`text-5xl mb-6 ${colors[color].split(' ')[0]} drop-shadow-md`}>{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
};

export default LandingPage;