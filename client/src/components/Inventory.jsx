import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';

const Inventory = () => {
  const [formData, setFormData] = useState({ name: '', category: 'Tablet', expiryDate: '', quantity: '', price: '' });
  const [medicines, setMedicines] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchMedicines = async () => {
    try { const res = await axios.get('https://medicaldashboard-2556.onrender.com/api/medicine/all'); setMedicines(res.data); } 
    catch (error) { console.error("Error:", error); }
  };
  useEffect(() => { fetchMedicines(); }, []);

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
      setFormData({ name: '', category: 'Tablet', expiryDate: '', quantity: '', price: '' });
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
    setFormData({ name: med.name, category: med.category, expiryDate: med.expiryDate.split('T')[0], quantity: med.quantity, price: med.price });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredMedicines = medicines.filter(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    // Updated Layout Class
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Inventory Management</h2>
        
        {/* Form Section (Responsive Grid) */}
        <div className={`p-6 rounded-xl shadow-lg mb-10 transition-colors ${editingId ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-white'}`}>
          <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2 flex items-center">
            {editingId ? <><FaEdit className="mr-2"/> Edit Medicine</> : <><FaPlus className="mr-2"/> Add New Stock</>}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="name" placeholder="Medicine Name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
              <select name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded-lg">
                <option>Tablet</option><option>Syrup</option><option>Injection</option><option>Cream</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
              <input type="number" name="quantity" placeholder="Quantity" value={formData.quantity} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
              <input type="number" name="price" placeholder="Price per Unit" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded-lg" required />
            </div>
            <div className="flex gap-4">
              <button type="submit" className={`flex-1 py-2 rounded-lg font-bold text-white transition ${editingId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {editingId ? 'Update Medicine' : 'Add Item'}
              </button>
              {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({ name: '', category: 'Tablet', expiryDate: '', quantity: '', price: '' })}} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Cancel</button>}
            </div>
          </form>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <input type="text" placeholder="Search by Medicine Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-4 pl-12 border rounded-xl shadow-sm outline-none" />
          <FaSearch className="absolute left-4 top-5 text-gray-400 text-lg" />
        </div>

        {/* Table Section (Responsive Scroll) */}
        <div className="bg-white p-6 rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-sm leading-normal">
                  <th className="py-3 px-6">Name</th>
                  <th className="py-3 px-6">Category</th>
                  <th className="py-3 px-6">Expiry</th>
                  <th className="py-3 px-6 text-center">Price</th>
                  <th className="py-3 px-6 text-center">Stock</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {filteredMedicines.map((med) => (
                  <tr key={med._id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-6 font-bold">{med.name}</td>
                    <td className="py-3 px-6">{med.category}</td>
                    <td className="py-3 px-6">{new Date(med.expiryDate).toLocaleDateString()}</td>
                    <td className="py-3 px-6 text-center">₹ {med.price}</td>
                    <td className="py-3 px-6 text-center"><span className={`py-1 px-3 rounded-full text-xs font-bold ${med.quantity < 10 ? 'bg-red-200 text-red-600' : 'bg-green-200 text-green-600'}`}>{med.quantity}</span></td>
                    <td className="py-3 px-6 text-center flex justify-center gap-3">
                      <button onClick={() => handleEdit(med)} className="text-yellow-500 hover:text-yellow-600"><FaEdit size={18} /></button>
                      <button onClick={() => handleDelete(med._id)} className="text-red-500 hover:text-red-600"><FaTrash size={18} /></button>
                    </td>
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