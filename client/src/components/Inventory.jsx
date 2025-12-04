import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSearch, FaPlus, FaBoxOpen } from 'react-icons/fa';
import { toast } from 'react-toastify'; 

const Inventory = () => {
  const [formData, setFormData] = useState({ name: '', category: 'Tablet', expiryDate: '', quantity: '', price: '', discount: '' });
  const [medicines, setMedicines] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchMedicines = async () => {
    try { 
      const res = await axios.get('https://medicaldashboard-2556.onrender.com/api/medicine/all'); 
      setMedicines(res.data); 
    } 
    catch (error) { console.error("Error:", error); }
  };
  useEffect(() => { fetchMedicines(); }, []);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`https://medicaldashboard-2556.onrender.com/api/medicine/update/${editingId}`, formData);
        toast.success('✅ Medicine Updated Successfully!');
        setEditingId(null);
      } else {
        await axios.post('https://medicaldashboard-2556.onrender.com/api/medicine/add', formData);
        toast.success('✨ New Medicine Added!');
      }
      setFormData({ name: '', category: 'Tablet', expiryDate: '', quantity: '', price: '', discount: '' });
      fetchMedicines();
    } catch (error) { toast.error('❌ Error saving medicine'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete medicine?")) {
      await axios.delete(`https://medicaldashboard-2556.onrender.com/api/medicine/delete/${id}`);
      toast.info('🗑️ Medicine Deleted');
      fetchMedicines();
    }
  };

  const handleEdit = (med) => {
    setEditingId(med._id);
    setFormData({ 
      name: med.name, category: med.category, expiryDate: med.expiryDate.split('T')[0], 
      quantity: med.quantity, price: med.price, discount: med.discount || 0 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredMedicines = medicines.filter(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-4 md:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-8 animate-fade-in flex items-center">
          <FaBoxOpen className="mr-3 text-blue-500"/> Inventory Management
        </h2>
        
        <div className={`glass-panel p-6 rounded-2xl mb-10 transition-all duration-300 border-l-4 ${editingId ? 'border-yellow-500' : 'border-blue-500'}`}>
          <h3 className="text-xl font-bold text-white mb-6 border-b border-gray-700 pb-2 flex items-center">
            {editingId ? <><FaEdit className="mr-2 text-yellow-400"/> Edit Medicine</> : <><FaPlus className="mr-2 text-blue-400"/> Add New Stock</>}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="text-gray-400 text-sm">Name</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-3 glass-input rounded-lg outline-none" required /></div>
              <div className="space-y-2"><label className="text-gray-400 text-sm">Category</label><select name="category" value={formData.category} onChange={handleChange} className="w-full p-3 glass-input rounded-lg outline-none"><option className="bg-gray-900">Tablet</option><option className="bg-gray-900">Syrup</option><option className="bg-gray-900">Injection</option><option className="bg-gray-900">Cream</option></select></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
               <div className="space-y-2"><label className="text-gray-400 text-sm">Expiry</label><input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full p-3 glass-input rounded-lg outline-none" required /></div>
               <div className="space-y-2"><label className="text-gray-400 text-sm">Qty</label><input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full p-3 glass-input rounded-lg outline-none" required /></div>
               <div className="space-y-2"><label className="text-gray-400 text-sm">Price</label><input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full p-3 glass-input rounded-lg outline-none" required /></div>
               <div className="space-y-2"><label className="text-gray-400 text-sm">Disc %</label><input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-full p-3 glass-input rounded-lg outline-none" /></div>
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" className={`flex-1 py-3 rounded-lg font-bold text-white transition ${editingId ? 'bg-yellow-600' : 'bg-blue-600'}`}>{editingId ? 'Update' : 'Add Stock'}</button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', category: 'Tablet', expiryDate: '', quantity: '', price: '', discount: '' })}} className="px-6 py-3 bg-gray-700 rounded-lg text-white">Cancel</button>}
            </div>
          </form>
        </div>

        <div className="mb-6 relative">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-4 pl-12 glass-panel rounded-xl shadow-sm outline-none text-white" />
          <FaSearch className="absolute left-4 top-5 text-gray-400 text-lg" />
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-gray-800/50 text-gray-400 uppercase text-xs"><tr><th className="py-4 px-6">Name</th><th className="py-4 px-6">Category</th><th className="py-4 px-6">Expiry</th><th className="py-4 px-6">Price</th><th className="py-4 px-6">Stock</th><th className="py-4 px-6">Action</th></tr></thead>
              <tbody className="text-gray-300 text-sm font-medium">
                {filteredMedicines.map((med) => (
                  <tr key={med._id} className="border-b border-gray-700 hover:bg-white/5">
                    <td className="py-4 px-6 font-bold text-white">{med.name}</td>
                    <td className="py-4 px-6">{med.category}</td>
                    <td className="py-4 px-6 text-blue-300">{new Date(med.expiryDate).toLocaleDateString()}</td>
                    <td className="py-4 px-6">₹{med.price}</td>
                    <td className="py-4 px-6">{med.quantity}</td>
                    <td className="py-4 px-6 flex gap-4"><button onClick={() => handleEdit(med)} className="text-yellow-400"><FaEdit/></button><button onClick={() => handleDelete(med._id)} className="text-red-400"><FaTrash/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Inventory;