import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { FaTimes, FaExclamationTriangle, FaCalendarTimes } from 'react-icons/fa';

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalStockValue: 0, lowStockItems: 0, expiringSoon: 0, totalMedicines: 0
  });
  const [chartData, setChartData] = useState([]);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [lowStockList, setLowStockList] = useState([]);
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [expiryList, setExpiryList] = useState([]);

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
      } catch (error) { console.error("Error fetching data:", error); }
    };
    fetchData();
  }, []);

  const handleLowStockClick = async () => {
    if (stats.lowStockItems > 0) {
      const res = await axios.get('https://medicaldashboard-2556.onrender.com/api/medicine/low-stock-list');
      setLowStockList(res.data);
      setShowLowStockModal(true);
    } else { alert("Good News! Stock full hai."); }
  };

  const handleExpiryClick = async () => {
    if (stats.expiringSoon > 0) {
      const res = await axios.get('https://medicaldashboard-2556.onrender.com/api/medicine/expiring-soon-list');
      setExpiryList(res.data);
      setShowExpiryModal(true);
    } else { alert("Badhiya! Koi dawai expire nahi ho rahi."); }
  };

  return (
    // Updated Layout Class (No ml-64)
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Store Overview</h2>

      {/* Cards Section (Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition">
          <h3 className="text-gray-500 text-sm">Total Stock Value</h3>
          <p className="text-2xl font-bold text-gray-800">₹ {stats.totalStockValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition">
          <h3 className="text-gray-500 text-sm">Total Medicines</h3>
          <p className="text-2xl font-bold text-gray-800">{stats.totalMedicines}</p>
        </div>
        <div onClick={handleExpiryClick} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-red-500 cursor-pointer hover:bg-red-50 transition transform hover:scale-105">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-gray-500 text-sm">Expiring Soon</h3>
              <p className={`text-2xl font-bold ${stats.expiringSoon > 0 ? 'text-red-600' : 'text-gray-800'}`}>{stats.expiringSoon} Items</p>
            </div>
            {stats.expiringSoon > 0 && <FaCalendarTimes className="text-red-500 text-2xl animate-pulse"/>}
          </div>
        </div>
        <div onClick={handleLowStockClick} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500 cursor-pointer hover:bg-yellow-50 transition transform hover:scale-105">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-gray-500 text-sm">Low Stock</h3>
              <p className={`text-2xl font-bold ${stats.lowStockItems > 0 ? 'text-yellow-600' : 'text-gray-800'}`}>{stats.lowStockItems} Items</p>
            </div>
            {stats.lowStockItems > 0 && <FaExclamationTriangle className="text-yellow-500 text-2xl animate-pulse"/>}
          </div>
        </div>
      </div>

      {/* Graph Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-bold text-gray-700 mb-4">Sales Trend (Last 7 Days)</h3>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Modals (Fixed Overlay for Mobile) */}
      {showLowStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in max-h-[80vh] flex flex-col">
            <div className="bg-yellow-500 p-4 flex justify-between items-center text-white">
              <h3 className="text-xl font-bold flex items-center"><FaExclamationTriangle className="mr-2"/> Low Stock Alert</h3>
              <button onClick={() => setShowLowStockModal(false)}><FaTimes size={24}/></button>
            </div>
            <div className="p-4 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="border-b text-gray-600"><tr><th className="py-2">Name</th><th className="py-2 text-center">Remaining</th></tr></thead>
                <tbody>{lowStockList.map(item => (<tr key={item._id} className="border-b"><td className="py-2">{item.name}</td><td className="py-2 text-center text-red-600 font-bold">{item.quantity}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showExpiryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in max-h-[80vh] flex flex-col">
            <div className="bg-red-600 p-4 flex justify-between items-center text-white">
              <h3 className="text-xl font-bold flex items-center"><FaCalendarTimes className="mr-2"/> Expiring Soon</h3>
              <button onClick={() => setShowExpiryModal(false)}><FaTimes size={24}/></button>
            </div>
            <div className="p-4 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="border-b text-gray-600"><tr><th className="py-2">Name</th><th className="py-2">Expiry</th><th className="py-2 text-center">Qty</th></tr></thead>
                <tbody>{expiryList.map(item => (<tr key={item._id} className="border-b"><td className="py-2">{item.name}</td><td className="py-2 text-red-600">{new Date(item.expiryDate).toLocaleDateString()}</td><td className="py-2 text-center font-bold">{item.quantity}</td></tr>))}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default DashboardStats;