import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEye, FaSearch, FaTimes, FaUndo } from 'react-icons/fa';

const SalesHistory = () => {
  const [groupedSales, setGroupedSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [returnQtys, setReturnQtys] = useState({});

  const fetchHistory = async () => {
    try {
      const res = await axios.get('https://medicaldashboard-2556.onrender.com/api/sales/history');
      groupData(res.data);
    } catch (error) { console.error("Error fetching history:", error); }
  };
  useEffect(() => { fetchHistory(); }, []);

  const groupData = (data) => {
    const groups = {};
    data.forEach(item => {
      const invId = item.invoiceId || `OLD-${item._id}`;
      if (!groups[invId]) {
        groups[invId] = { invoiceId: invId, patientName: item.patientName || "Unknown", date: item.saleDate, totalBillAmount: 0, items: [] };
      }
      groups[invId].items.push(item);
      groups[invId].totalBillAmount += item.totalAmount;
    });
    setGroupedSales(Object.values(groups).sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const processReturn = async (itemId, currentQty) => {
    const qtyToReturn = returnQtys[itemId] || 0;
    if (qtyToReturn <= 0) return alert("Select return quantity");
    if (window.confirm("Confirm return?")) {
      try {
        const res = await axios.post('https://medicaldashboard-2556.onrender.com/api/sales/return', { saleId: itemId, returnQty: qtyToReturn });
        alert(`✅ Refund: ₹ ${res.data.refundAmount}`);
        setSelectedInvoice(null); setReturnQtys({}); fetchHistory();
      } catch (error) { alert("Return Failed: " + (error.response?.data?.error || "Error")); }
    }
  };

  const filteredSales = groupedSales.filter(group => 
    group.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    group.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Updated Layout Class
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Sales History</h2>

      <div className="mb-6 bg-white p-4 rounded-xl shadow flex items-center max-w-md w-full">
        <FaSearch className="text-gray-400 mr-3"/>
        <input type="text" placeholder="Search Patient or Invoice..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full outline-none" />
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-4">Date</th><th className="p-4">Invoice ID</th><th className="p-4">Patient</th><th className="p-4 text-right">Bill</th><th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filteredSales.map(bill => (
                <tr key={bill.invoiceId} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm">{new Date(bill.date).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-gray-500">{bill.invoiceId}</td>
                  <td className="p-4 font-bold">{bill.patientName}</td>
                  <td className="p-4 text-right font-bold text-green-600">₹ {bill.totalBillAmount}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => setSelectedInvoice(bill)} className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition font-bold flex items-center justify-center mx-auto">
                      <FaEye className="mr-2"/> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
              <div><h3 className="text-xl font-bold">Details</h3><p className="text-sm text-gray-400">ID: {selectedInvoice.invoiceId}</p></div>
              <button onClick={() => setSelectedInvoice(null)}><FaTimes size={24}/></button>
            </div>
            <div className="p-4 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="border-b text-gray-600 text-sm bg-gray-50"><tr><th className="p-3">Item</th><th className="p-3">Sold</th><th className="p-3">Total</th><th className="p-3 text-center">Return Qty</th><th className="p-3 text-center">Action</th></tr></thead>
                <tbody>
                  {selectedInvoice.items.map(item => (
                    <tr key={item._id} className="border-b text-gray-600">
                      <td className="p-3">{item.medicineName}</td><td className="p-3">{item.quantitySold}</td><td className="p-3">₹{item.totalAmount}</td>
                      <td className="p-3 text-center"><input type="number" min="0" max={item.quantitySold} onChange={(e) => setReturnQtys({...returnQtys, [item._id]: e.target.value})} className="w-16 p-1 border rounded text-center"/></td>
                      <td className="p-3 text-center"><button onClick={() => processReturn(item._id, item.quantitySold)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><FaUndo /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SalesHistory;