import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSearch, FaPlus, FaBoxOpen } from 'react-icons/fa';

const Inventory = () => {
  // State for form and list
  const [formData, setFormData] = useState({ 
    name: '', category: 'Tablet', expiryDate: '', quantity: '', price: '', discount: '' // Added Discount
  });
  const [medicines, setMedicines] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Fetch Data
  const fetchMedicines = async () => {
    try { 
      // Replace with your Render URL if deployed
      const res = await axios.get('https://medicaldashboard-2556.onrender.com/api/medicine/all'); 
      setMedicines(res.data); 
    } 
    catch (error) { console.error("Error:", error); }
  };
  useEffect(() => { fetchMedicines(); }, []);

  // Handlers
  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`https://medicaldashboard-2556.onrender.com/api/medicine/update/${editingId}`, formData);
        alert('✅ Medicine Updated'); setEditingId(null);
      } else {
        await axios.post('https://medicaldashboard-2556.onrender.com/api/medicine/add', formData);
        alert('✅ Medicine Added');
      }
      setFormData({ name: '', category: 'Tablet', expiryDate: '', quantity: '', price: '', discount: '' });
      fetchMedicines();
    } catch (error) { alert('❌ Error processing request'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete medicine?")) {
      await axios.delete(`https://medicaldashboard-2556.onrender.com/api/medicine/delete/${id}`);
      fetchMedicines();
    }
  };

  const handleEdit = (med) => {
    setEditingId(med._id);
    setFormData({ 
      name: med.name, 
      category: med.category, 
      expiryDate: med.expiryDate.split('T')[0], 
      quantity: med.quantity, 
      price: med.price,
      discount: med.discount || 0 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredMedicines = medicines.filter(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8 animate-fade-in flex items-center">
          <FaBoxOpen className="mr-3 text-blue-500"/> Inventory Management
        </h2>
        
        {/* --- FORM SECTION (Glassmorphism) --- */}
        <div className={`glass-panel p-6 rounded-2xl mb-10 transition-all duration-300 border-l-4 ${editingId ? 'border-yellow-500' : 'border-blue-500'}`}>
          <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-2 flex items-center">
            {editingId ? <><FaEdit className="mr-2 text-yellow-400"/> Edit Medicine</> : <><FaPlus className="mr-2 text-blue-400"/> Add New Stock</>}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Medicine Name</label>
                <input type="text" name="name" placeholder="e.g. Dolo 650" value={formData.name} onChange={handleChange} className="w-full p-3 glass-input rounded-lg outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 glass-input rounded-lg outline-none cursor-pointer">
                  <option className="bg-gray-900">Tablet</option>
                  <option className="bg-gray-900">Syrup</option>
                  <option className="bg-gray-900">Injection</option>
                  <option className="bg-gray-900">Cream</option>
                  <option className="bg-gray-900">Drops</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Expiry Date</label>
                <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full p-3 glass-input rounded-lg outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Quantity</label>
                <input type="number" name="quantity" placeholder="0" value={formData.quantity} onChange={handleChange} className="w-full p-3 glass-input rounded-lg outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Price (MRP)</label>
                <input type="number" name="price" placeholder="₹" value={formData.price} onChange={handleChange} className="w-full p-3 glass-input rounded-lg outline-none" required />
              </div>
              {/* NEW DISCOUNT FIELD */}
              <div className="space-y-2">
                <label className="text-gray-400 text-sm">Discount %</label>
                <input type="number" name="discount" placeholder="%" value={formData.discount} onChange={handleChange} className="w-full p-3 glass-input rounded-lg outline-none border border-green-500/30 focus:border-green-500" />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button type="submit" className={`flex-1 py-3 rounded-lg font-bold text-white transition shadow-lg ${editingId ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {editingId ? 'Update Medicine' : 'Add Item to Inventory'}
              </button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', category: 'Tablet', expiryDate: '', quantity: '', price: '', discount: '' })}} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">Cancel</button>}
            </div>
          </form>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="mb-6 relative">
          <input type="text" placeholder="Search by Medicine Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-4 pl-12 glass-panel rounded-xl shadow-sm outline-none text-white placeholder-gray-500 focus:border-blue-500 border border-transparent transition" />
          <FaSearch className="absolute left-4 top-5 text-gray-400 text-lg" />
        </div>

        {/* --- TABLE SECTION --- */}
        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-gray-800/50 text-gray-400 uppercase text-xs tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Expiry</th>
                  <th className="py-4 px-6 text-center">Price</th>
                  <th className="py-4 px-6 text-center">Disc %</th>
                  <th className="py-4 px-6 text-center">Stock</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 text-sm font-medium">
                {filteredMedicines.map((med) => (
                  <tr key={med._id} className="border-b border-gray-700 hover:bg-white/5 transition duration-200">
                    <td className="py-4 px-6 font-bold text-white">{med.name}</td>
                    <td className="py-4 px-6 text-gray-400">{med.category}</td>
                    <td className="py-4 px-6 text-blue-300">{new Date(med.expiryDate).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-center">₹ {med.price}</td>
                    <td className="py-4 px-6 text-center text-green-400 font-bold">{med.discount || 0}%</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`py-1 px-3 rounded-full text-xs font-bold ${med.quantity < 10 ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-green-500/20 text-green-400 border border-green-500/50'}`}>
                        {med.quantity}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center flex justify-center gap-4">
                      <button onClick={() => handleEdit(med)} className="text-yellow-400 hover:text-yellow-300 transition hover:scale-110"><FaEdit size={18} /></button>
                      <button onClick={() => handleDelete(med._id)} className="text-red-400 hover:text-red-300 transition hover:scale-110"><FaTrash size={18} /></button>
                    </td>
                  </tr>
                ))}
                {filteredMedicines.length === 0 && (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-500">No medicines found matching "{searchTerm}"</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Inventory;