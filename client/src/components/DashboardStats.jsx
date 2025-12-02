import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { 
  FaTimes, FaExclamationTriangle, FaCalendarTimes, FaRupeeSign, FaPills, FaClinicMedical 
} from 'react-icons/fa';

const DashboardStats = () => {
  // --- STATES ---
  const [stats, setStats] = useState({
    totalStockValue: 0,
    lowStockItems: 0,
    expiringSoon: 0,
    totalMedicines: 0
  });
  const [chartData, setChartData] = useState([]);
  
  // Modals
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [lowStockList, setLowStockList] = useState([]);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [expiryList, setExpiryList] = useState([]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await axios.get('https://medicaldashboard-2556.onrender.com/api/dashboard/stats');
        setStats(statsRes.data);

        const chartRes = await axios.get('https://medicaldashboard-2556.onrender.com/api/sales/chart');
        const formattedData = chartRes.data.map(item => ({
          name: item._id.split('-').slice(1).join('/'),
          sales: item.totalSales
        }));
        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // --- HANDLERS ---
  const handleLowStockClick = async () => {
    if (stats.lowStockItems > 0) {
      try {
        const res = await axios.get('https://medicaldashboard-2556.onrender.com/api/medicine/low-stock-list');
        setLowStockList(res.data);
        setShowLowStockModal(true);
      } catch (e) { console.error(e); }
    }
  };

  const handleExpiryClick = async () => {
    if (stats.expiringSoon > 0) {
      try {
        const res = await axios.get('https://medicaldashboard-2556.onrender.com/api/medicine/expiring-soon-list');
        setExpiryList(res.data);
        setShowExpiryModal(true);
      } catch (e) { console.error(e); }
    }
  };

  // --- REUSABLE NEON CARD ---
  const StatCard = ({ title, value, icon, color, onClick, isClickable }) => {
    const borderColors = {
      blue: 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]',
      green: 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]',
      red: 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
      yellow: 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]'
    };
    const textColors = {
      blue: 'text-blue-400', green: 'text-green-400', red: 'text-red-400', yellow: 'text-yellow-400'
    };

    return (
      <div 
        onClick={isClickable ? onClick : undefined}
        className={`glass-panel p-6 rounded-2xl relative overflow-hidden group transition-all duration-300 ${isClickable ? 'cursor-pointer hover:-translate-y-2 hover:bg-white/5' : ''} border-l-4 ${borderColors[color]}`}
      >
        <div className={`absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-all duration-500 text-8xl ${textColors[color]}`}>{icon}</div>
        <div className="relative z-10">
          <div className={`text-3xl mb-2 ${textColors[color]}`}>{icon}</div>
          <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
          <p className="text-3xl font-bold text-white mt-1 drop-shadow-md">{value}</p>
          {isClickable && <div className="mt-4 flex items-center text-xs text-gray-300 group-hover:text-white transition-colors">View Details <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span></div>}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 min-h-screen">
      
      {/* --- STORE NAME HEADER (CENTERED) --- */}
      <div className="text-center mb-12 animate-fade-in relative z-10">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-2 flex justify-center items-center gap-4">
          <FaClinicMedical className="text-blue-500 animate-pulse" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">
            AIR Medical Store
          </span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl tracking-wide">
          Advanced Inventory & Sales Dashboard
        </p>
        {/* Divider Line */}
        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mt-6 rounded-full opacity-70"></div>
      </div>

      {/* Section Title */}
      <h2 className="text-2xl font-bold text-gray-200 mb-6 flex items-center">
        <span className="w-1 h-6 bg-blue-500 mr-3 rounded-full shadow-[0_0_10px_#3b82f6]"></span>
        Overview
      </h2>

      {/* --- NEON CARDS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
        <StatCard title="Total Stock Value" value={`₹ ${stats.totalStockValue.toLocaleString()}`} icon={<FaRupeeSign/>} color="blue" />
        <StatCard title="Total Medicines" value={stats.totalMedicines} icon={<FaPills/>} color="green" />
        <StatCard title="Expiring Soon" value={`${stats.expiringSoon} Items`} icon={<FaCalendarTimes/>} color="red" onClick={handleExpiryClick} isClickable={true} />
        <StatCard title="Low Stock" value={`${stats.lowStockItems} Items`} icon={<FaExclamationTriangle/>} color="yellow" onClick={handleLowStockClick} isClickable={true} />
      </div>

      {/* --- CHART SECTION --- */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl shadow-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-200 flex items-center">
            <span className="w-1 h-6 bg-blue-500 mr-3 rounded-full shadow-[0_0_10px_#3b82f6]"></span>
            Sales Analytics
          </h3>
          <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">Last 7 Days</span>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
              <XAxis dataKey="name" stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} tickLine={false} axisLine={false}/>
              <YAxis stroke="#9ca3af" tick={{fill: '#9ca3af', fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`}/>
              <Tooltip contentStyle={{ backgroundColor: 'rgba(17, 24, 39, 0.9)', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#60a5fa' }}/>
              <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- MODALS --- */}
      {[
        { show: showLowStockModal, close: () => setShowLowStockModal(false), title: "Low Stock Alert", icon: <FaExclamationTriangle/>, data: lowStockList, color: "yellow", headerColor: "text-yellow-400" },
        { show: showExpiryModal, close: () => setShowExpiryModal(false), title: "Expiring Soon", icon: <FaCalendarTimes/>, data: expiryList, color: "red", headerColor: "text-red-400" }
      ].map((modal, idx) => (
        modal.show && (
          <div key={idx} className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="glass-panel w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-gray-700">
              <div className="p-5 flex justify-between items-center border-b border-gray-700 bg-gray-800/50">
                <h3 className={`text-xl font-bold flex items-center gap-3 ${modal.headerColor}`}>{modal.icon} {modal.title}</h3>
                <button onClick={modal.close} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition"><FaTimes size={20}/></button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {modal.data.length > 0 ? (
                  <table className="w-full text-left text-gray-300">
                    <thead className="text-gray-500 uppercase text-xs border-b border-gray-700"><tr><th className="py-3 px-2">Medicine Name</th><th className="py-3 px-2">Category</th><th className="py-3 px-2 text-center">{modal.color === 'red' ? 'Expiry Date' : 'Stock Qty'}</th></tr></thead>
                    <tbody>{modal.data.map((item) => (<tr key={item._id} className="border-b border-gray-800 hover:bg-white/5 transition duration-200"><td className="py-4 px-2 font-medium text-white">{item.name}</td><td className="py-4 px-2 text-sm text-gray-400">{item.category}</td><td className={`py-4 px-2 text-center font-bold ${modal.color === 'red' ? 'text-red-400' : 'text-yellow-400'}`}>{modal.color === 'red' ? new Date(item.expiryDate).toLocaleDateString() : item.quantity}</td></tr>))}</tbody>
                  </table>
                ) : (<div className="text-center py-8 text-gray-500">No items found.</div>)}
              </div>
              <div className="p-4 border-t border-gray-700 text-right bg-gray-800/50"><button onClick={modal.close} className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition shadow-lg">Close</button></div>
            </div>
          </div>
        )
      ))}
    </div>
  );
};
export default DashboardStats;