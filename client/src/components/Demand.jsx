import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import { FaPlus, FaTrash, FaDownload, FaClipboardList } from 'react-icons/fa';

const Demand = () => {
  const [demands, setDemands] = useState([]);
  const [medicineName, setMedicineName] = useState('');

  const fetchDemands = async () => {
    try { const res = await axios.get('https://medicaldashboard-2556.onrender.com/api/demand/all'); setDemands(res.data); } 
    catch (error) { console.error(error); }
  };
  useEffect(() => { fetchDemands(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!medicineName.trim()) return;
    try {
      await axios.post('https://medicaldashboard-2556.onrender.com/api/demand/add', { medicineName });
      setMedicineName(''); fetchDemands();
    } catch (error) { alert(error.response?.data?.error || "Error"); }
  };

  const handleDelete = async (id) => {
    await axios.delete(`https://medicaldashboard-2556.onrender.com/api/demand/delete/${id}`); fetchDemands();
  };

  const handleDownloadPDF = () => {
    if (demands.length === 0) return alert("List is empty!");
    const doc = new jsPDF();
    doc.text("Shortage List", 14, 20);
    autoTable(doc, {
      head: [["#", "Medicine Name", "Date"]],
      body: demands.map((item, i) => [i + 1, item.medicineName, new Date(item.noteDate).toLocaleDateString()]),
      startY: 30,
    });
    doc.save("Demand_List.pdf");
  };

  return (
    // Updated Layout Class
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center">
          <FaClipboardList className="mr-3 text-red-600"/> Demand List
        </h2>
        <button onClick={handleDownloadPDF} className="w-full md:w-auto bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900 flex justify-center items-center shadow-lg">
          <FaDownload className="mr-2"/> Download PDF
        </button>
      </div>
      
      {/* Input Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 max-w-2xl border-t-4 border-purple-500">
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
          <input type="text" placeholder="Medicine Name..." value={medicineName} onChange={(e) => setMedicineName(e.target.value)} className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
          <button type="submit" className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 flex justify-center items-center">
            <FaPlus className="mr-2"/> Add Note
          </button>
        </form>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[500px]">
            <thead className="bg-gray-200 text-gray-700">
              <tr><th className="p-4">#</th><th className="p-4">Medicine Name</th><th className="p-4">Date Noted</th><th className="p-4 text-center">Action</th></tr>
            </thead>
            <tbody>
              {demands.map((item, index) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-bold">{index + 1}</td>
                  <td className="p-4 font-medium text-lg">{item.medicineName}</td>
                  <td className="p-4 text-gray-500">{new Date(item.noteDate).toLocaleDateString()}</td>
                  <td className="p-4 text-center"><button onClick={() => handleDelete(item._id)} className="text-red-500 hover:bg-red-100 p-2 rounded-full"><FaTrash /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Demand;