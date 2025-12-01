import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import { FaCartPlus, FaTrash, FaFileInvoice, FaSearch, FaBoxOpen, FaUserInjured } from 'react-icons/fa';

const Sales = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedMed, setSelectedMed] = useState(null);
  const [patientName, setPatientName] = useState('');

  // 1. Fetch Medicines
  const fetchMedicines = async () => {
    try {
      const res = await axios.get('https://medicaldashboard-2556.onrender.com/api/medicine/all');
      setMedicines(res.data);
    } catch (error) {
      console.error("Error fetching medicines:", error);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // 2. Add to Cart
  const addToCart = () => {
    if (!selectedMed) return alert("Please select a medicine");
    if (quantity <= 0) return alert("Invalid Quantity");
    if (selectedMed.quantity < quantity) return alert("Not enough stock!");

    // Prevent duplicates
    const existingItem = cart.find(item => item.id === selectedMed._id);
    if (existingItem) return alert("Item already in cart!");

    const newItem = {
      id: selectedMed._id,
      name: selectedMed.name,
      price: selectedMed.price,
      quantity: parseInt(quantity),
      total: selectedMed.price * parseInt(quantity)
    };

    setCart([...cart, newItem]);
    setSelectedMed(null);
    setQuantity(1);
    setSearchTerm('');
  };

  const removeFromCart = (index) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
  };

  const grandTotal = cart.reduce((acc, item) => acc + item.total, 0);

  // 3. Checkout (With Invoice Grouping)
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    if (!patientName.trim()) return alert("Please Enter Patient Name!");

    // Generate Unique Invoice ID for this entire bill
    const invoiceId = `INV-${Date.now()}`;

    try {
      for (const item of cart) {
        await axios.post('https://medicaldashboard-2556.onrender.com/api/sales/add', {
          invoiceId: invoiceId, // <-- Same ID for all items
          medicineId: item.id,
          quantity: item.quantity,
          patientName: patientName
        });
      }

      alert('✅ Sale Complete! Downloading Bill...');
      
      // PDF Generation
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(40);
      doc.text("AIR Medical Store", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(0);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Invoice ID: ${invoiceId}`, 14, 35);
      doc.setFontSize(12);
      doc.text(`Patient Name: ${patientName}`, 14, 45);

      const tableColumn = ["Medicine", "Qty", "Price", "Total"];
      const tableRows = [];

      cart.forEach(item => {
        const row = [item.name, item.quantity, `Rs. ${item.price}`, `Rs. ${item.total}`];
        tableRows.push(row);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 160, 133] } 
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text(`Grand Total: Rs. ${grandTotal}`, 14, finalY);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text("Get Well Soon! Visit Again.", 14, finalY + 10);

      doc.save(`AIR_Medical_Bill_${patientName}.pdf`);

      setCart([]);
      setPatientName('');
      fetchMedicines();

    } catch (error) {
      console.error(error);
      alert('Error during checkout: ' + (error.response?.data?.error || "Unknown Error"));
    }
  };

  const filteredMedicines = medicines.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ml-0 md:ml-64 p-4 md:p-8 bg-gray-100 min-h-screen flex flex-col lg:flex-row gap-6 transition-all duration-300">
      
      {/* Search & Add */}
      <div className="w-full lg:w-1/2 bg-white p-6 rounded-xl shadow-lg h-fit border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FaBoxOpen className="mr-2 text-blue-600"/> Select Items
        </h2>
        
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="Search Medicine..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-4 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <FaSearch className="absolute left-4 top-5 text-gray-400 text-lg" />
        </div>

        {searchTerm && (
          <ul className="mb-6 border border-gray-200 rounded-xl max-h-60 overflow-y-auto shadow-inner bg-gray-50">
            {filteredMedicines.length > 0 ? (
              filteredMedicines.map(med => (
                <li key={med._id} 
                  onClick={() => { setSelectedMed(med); setSearchTerm(med.name); }}
                  className="p-3 hover:bg-blue-100 cursor-pointer border-b flex justify-between items-center"
                >
                  <span className="font-medium text-gray-700">{med.name}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${med.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    Stock: {med.quantity}
                  </span>
                </li>
              ))
            ) : (<li className="p-4 text-center">No medicines found</li>)}
          </ul>
        )}

        {selectedMed && (
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-sm animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-xl text-blue-800">{selectedMed.name}</h3>
              <span className="text-lg font-bold text-gray-700">₹{selectedMed.price}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-bold text-gray-600 mb-1">Quantity</label>
                <input 
                  type="number" min="1" max={selectedMed.quantity}
                  value={quantity} onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button onClick={addToCart} className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center shadow-lg transform active:scale-95">
                <FaCartPlus className="mr-2"/> Add to Cart
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cart & Checkout */}
      <div className="w-full lg:w-1/2 bg-white p-6 rounded-xl shadow-lg h-fit border border-gray-200 flex flex-col">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <FaFileInvoice className="mr-2 text-green-600"/> Generate Invoice
        </h2>

        <div className="mb-6">
          <label className="block text-gray-600 font-bold mb-2">Patient Name <span className="text-red-500">*</span></label>
          <div className="relative">
             <input type="text" placeholder="Enter Patient Name" 
              value={patientName} onChange={(e) => setPatientName(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
            <FaUserInjured className="absolute left-3 top-4 text-gray-400"/>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
            <FaCartPlus size={40} className="mb-2 opacity-50"/>
            <p>Cart is empty</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse mb-6">
                <thead>
                  <tr className="border-b-2 border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                    <th className="py-3 font-semibold">Item</th>
                    <th className="py-3 font-semibold text-center">Qty</th>
                    <th className="py-3 font-semibold text-right">Price</th>
                    <th className="py-3 font-semibold text-right">Total</th>
                    <th className="py-3 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700 text-sm">
                  {cart.map((item, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition">
                      <td className="py-3 font-medium">{item.name}</td>
                      <td className="py-3 text-center">{item.quantity}</td>
                      <td className="py-3 text-right">₹{item.price}</td>
                      <td className="py-3 text-right font-bold text-gray-900">₹{item.total}</td>
                      <td className="py-3 text-center">
                        <button onClick={() => removeFromCart(index)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"><FaTrash /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-auto">
              <div className="flex justify-between items-center text-xl font-bold border-t-2 border-gray-100 pt-4 mb-6">
                <span className="text-gray-600">Grand Total:</span>
                <span className="text-blue-700 text-2xl">₹ {grandTotal.toLocaleString()}</span>
              </div>
              <button onClick={handleCheckout} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex justify-center items-center text-lg">
                <FaFileInvoice className="mr-2"/> Print Bill & Save
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default Sales;