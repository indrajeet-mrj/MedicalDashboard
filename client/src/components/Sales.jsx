import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import { FaCartPlus, FaTrash, FaFileInvoice, FaSearch, FaBoxOpen, FaUserInjured, FaPercentage } from 'react-icons/fa';

const Sales = () => {
  // State Variables
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedMed, setSelectedMed] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [manualDiscount, setManualDiscount] = useState(0); // Extra Discount %

  // Fetch Medicines
  const fetchMedicines = async () => {
    try { 
      const res = await axios.get('https://medicaldashboard-2556.onrender.com/api/medicine/all'); 
      setMedicines(res.data); 
    } 
    catch (error) { console.error("Error fetching medicines:", error); }
  };
  useEffect(() => { fetchMedicines(); }, []);

  // Add To Cart with Discount Logic
  const addToCart = () => {
    if (!selectedMed) return alert("Select medicine");
    if (quantity <= 0) return alert("Invalid Qty");
    if (selectedMed.quantity < quantity) return alert("Low Stock");
    if (cart.find(item => item.id === selectedMed._id)) return alert("Already in cart");

    // Logic: Use Medicine's saved discount
    const unitPrice = selectedMed.price;
    const itemDiscount = selectedMed.discount || 0; 
    const finalUnitTestPrice = unitPrice - (unitPrice * itemDiscount / 100);

    const newItem = {
      id: selectedMed._id,
      name: selectedMed.name,
      price: unitPrice,
      discount: itemDiscount, // Stored discount
      quantity: parseInt(quantity),
      total: finalUnitTestPrice * parseInt(quantity) // Total amount after discount
    };

    setCart([...cart, newItem]);
    setSelectedMed(null); setQuantity(1); setSearchTerm('');
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Grand Total Calculation
  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);
  const finalBillAmount = cartTotal - (cartTotal * manualDiscount / 100);

  // Checkout & PDF
  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart Empty");
    if (!patientName.trim()) return alert("Enter Patient Name");

    // Fetch Store Name for PDF
    const storeName = localStorage.getItem('storeName') || "Medical Store";
    const invoiceId = `INV-${Date.now()}`;

    try {
      // Backend Requests
      for (const item of cart) {
        await axios.post('https://medicaldashboard-2556.onrender.com/api/sales/add', {
          invoiceId, 
          medicineId: item.id, 
          quantity: item.quantity, 
          patientName, 
          discount: item.discount // Save item discount to backend
        });
      }

      alert('✅ Sale Complete!');
      
      // PDF Generation
      const doc = new jsPDF();
      doc.setFontSize(22); doc.setTextColor(40);
      doc.text(storeName, 14, 20); // Dynamic Store Name
      
      doc.setFontSize(10); doc.setTextColor(0);
      doc.text(`Invoice: ${invoiceId}`, 14, 30);
      doc.text(`Patient: ${patientName}`, 14, 35);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 40);

      const tableRows = cart.map(item => [
        item.name, 
        item.quantity, 
        `Rs.${item.price}`, 
        `${item.discount}%`, 
        `Rs.${item.total.toFixed(2)}`
      ]);

      autoTable(doc, {
        head: [["Item", "Qty", "Price", "Disc%", "Total"]],
        body: tableRows,
        startY: 50,
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text(`Sub Total: Rs. ${cartTotal.toFixed(2)}`, 14, finalY);
      
      if(manualDiscount > 0) {
        doc.text(`Extra Discount: ${manualDiscount}%`, 14, finalY + 6);
        doc.setFontSize(16);
        doc.text(`Grand Total: Rs. ${finalBillAmount.toFixed(2)}`, 14, finalY + 14);
      } else {
        doc.setFontSize(16);
        doc.text(`Grand Total: Rs. ${finalBillAmount.toFixed(2)}`, 14, finalY + 10);
      }
      
      doc.save(`${storeName}_Bill_${patientName}.pdf`);
      setCart([]); setPatientName(''); setManualDiscount(0); fetchMedicines();

    } catch (error) { alert("Error: " + error.message); }
  };

  const filteredMedicines = medicines.filter(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-4 md:p-8 min-h-screen flex flex-col lg:flex-row gap-6">
      
      {/* Left: Select Items */}
      <div className="w-full lg:w-1/2 glass-panel p-6 rounded-xl border border-blue-500/20">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center"><FaBoxOpen className="mr-2 text-blue-400"/> Select Items</h2>
        
        <div className="relative mb-6">
          <input type="text" placeholder="Search medicines..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 pl-10 glass-input rounded-lg outline-none text-white placeholder-gray-500" />
          <FaSearch className="absolute left-3 top-4 text-gray-400"/>
        </div>

        {searchTerm && (
          <ul className="mb-6 glass-panel rounded-xl max-h-60 overflow-y-auto border border-gray-700">
            {filteredMedicines.map(med => (
              <li key={med._id} onClick={() => { setSelectedMed(med); setSearchTerm(med.name); }} className="p-3 hover:bg-white/10 cursor-pointer border-b border-gray-700 flex justify-between items-center text-white transition">
                <div>
                  <span className="font-bold">{med.name}</span>
                  {med.discount > 0 && <span className="ml-2 text-xs bg-green-500/20 text-green-400 border border-green-500/50 px-2 py-0.5 rounded font-bold">-{med.discount}% Off</span>}
                </div>
                <span className="text-xs text-gray-400">Qty: {med.quantity}</span>
              </li>
            ))}
          </ul>
        )}

        {selectedMed && (
          <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-500/30 animate-fade-in">
            <h3 className="font-bold text-xl text-blue-300">{selectedMed.name}</h3>
            <p className="text-gray-400">Price: ₹{selectedMed.price} {selectedMed.discount > 0 && <span className="text-green-400 font-bold ml-1">({selectedMed.discount}% Disc Applied)</span>}</p>
            <div className="flex gap-4 mt-4">
              <input type="number" min="1" max={selectedMed.quantity} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-20 p-2 glass-input rounded-lg text-white outline-none focus:border-blue-500 border border-gray-600" />
              <button onClick={addToCart} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition shadow-lg hover:scale-105"><FaCartPlus className="mr-2"/> Add to Cart</button>
            </div>
          </div>
        )}
      </div>

      {/* Right: Bill Section */}
      <div className="w-full lg:w-1/2 glass-panel p-6 rounded-xl flex flex-col border border-green-500/20">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center"><FaFileInvoice className="mr-2 text-green-400"/> Invoice</h2>
        
        {/* Patient Name */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-1 block">Patient Name</label>
          <div className="relative">
            <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full p-2 pl-9 glass-input rounded-lg text-white outline-none focus:border-green-500 border border-gray-600" placeholder="Enter name" />
            <FaUserInjured className="absolute left-3 top-3 text-gray-500"/>
          </div>
        </div>

        {/* Extra Discount Input */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-1 block">Extra Bill Discount (%)</label>
          <div className="relative">
            <input type="number" value={manualDiscount} onChange={(e) => setManualDiscount(Number(e.target.value))} className="w-full p-2 pl-9 glass-input rounded-lg text-white outline-none focus:border-green-500 border border-gray-600" placeholder="0" />
            <FaPercentage className="absolute left-3 top-3 text-gray-500"/>
          </div>
        </div>

        {/* Cart Items Table */}
        <div className="flex-1 overflow-auto mb-4 bg-black/20 rounded-lg p-2 custom-scrollbar max-h-[300px]">
          <table className="w-full text-left text-gray-300 text-sm">
            <thead className="border-b border-gray-700 text-gray-500 uppercase text-xs"><tr><th className="p-2">Item</th><th className="p-2">Qty</th><th className="p-2">Disc</th><th className="p-2">Total</th><th></th></tr></thead>
            <tbody>
              {cart.map((item, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-white/5 transition">
                  <td className="p-2 font-medium text-white">{item.name}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2 text-green-400 font-bold">{item.discount}%</td>
                  <td className="p-2 text-white font-bold">₹{item.total.toFixed(0)}</td>
                  <td className="p-2"><button onClick={() => removeFromCart(i)} className="text-red-400 hover:text-red-200 transition"><FaTrash/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Checkout */}
        <div className="border-t border-gray-700 pt-4 mt-auto">
          <div className="flex justify-between text-gray-400 mb-1"><span>Sub Total:</span><span>₹ {cartTotal.toFixed(2)}</span></div>
          {manualDiscount > 0 && <div className="flex justify-between text-green-400 mb-1"><span>Extra Discount:</span><span>- {manualDiscount}%</span></div>}
          <div className="flex justify-between text-3xl font-bold text-white mt-2 mb-4"><span>Total:</span><span>₹ {finalBillAmount.toFixed(0)}</span></div>
          
          <button onClick={handleCheckout} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:scale-[1.02]">
            Print Bill & Save
          </button>
        </div>
      </div>
    </div>
  );
};
export default Sales;