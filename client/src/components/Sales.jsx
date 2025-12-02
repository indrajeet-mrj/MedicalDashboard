import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import { FaCartPlus, FaTrash, FaFileInvoice, FaSearch, FaBoxOpen, FaUserInjured, FaPercentage } from 'react-icons/fa';

const Sales = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedMed, setSelectedMed] = useState(null);
  
  // States
  const [patientName, setPatientName] = useState('');
  const [manualDiscount, setManualDiscount] = useState(0); // Overall Bill Discount

  const fetchMedicines = async () => {
    try { const res = await axios.get('https://medicaldashboard-2556.onrender.com/api/medicine/all'); setMedicines(res.data); } 
    catch (error) { console.error("Error fetching medicines:", error); }
  };
  useEffect(() => { fetchMedicines(); }, []);

  // Updated Add to Cart Logic (Auto-apply medicine specific discount)
  const addToCart = () => {
    if (!selectedMed) return alert("Select medicine");
    if (quantity <= 0) return alert("Invalid Qty");
    if (selectedMed.quantity < quantity) return alert("Low Stock");
    if (cart.find(item => item.id === selectedMed._id)) return alert("Already in cart");

    // Calculate Item Price with Medicine's Default Discount
    const unitPrice = selectedMed.price;
    const itemDiscount = selectedMed.discount || 0; 
    const finalUnitTestPrice = unitPrice - (unitPrice * itemDiscount / 100);

    const newItem = {
      id: selectedMed._id,
      name: selectedMed.name,
      price: unitPrice,
      discount: itemDiscount, // Store discount %
      quantity: parseInt(quantity),
      total: finalUnitTestPrice * parseInt(quantity) // Total after discount
    };

    setCart([...cart, newItem]);
    setSelectedMed(null); setQuantity(1); setSearchTerm('');
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Grand Total Calculation (Applying Extra Manual Discount if needed)
  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);
  const finalBillAmount = cartTotal - (cartTotal * manualDiscount / 100);

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Cart Empty");
    if (!patientName.trim()) return alert("Enter Patient Name");

    const invoiceId = `INV-${Date.now()}`;
    try {
      for (const item of cart) {
        // Apply logic: Item discount + Manual Overall Discount combination is complex.
        // For simplicity: Backend saves 'Item Discount'. Manual discount is handled on total bill here visually, 
        // but typically you apply manual discount to each item or as a separate entry.
        // Here we send the Item's specific discount to backend.
        
        await axios.post('https://medicaldashboard-2556.onrender.com/api/sales/add', {
          invoiceId, medicineId: item.id, quantity: item.quantity, 
          patientName, discount: item.discount // Sending item specific discount
        });
      }

      alert('✅ Sale Complete!');
      
      // PDF Generation
      const doc = new jsPDF();
      doc.setFontSize(22); doc.text("AIR Medical Store", 14, 20);
      doc.setFontSize(10); doc.text(`Invoice: ${invoiceId}`, 14, 30);
      doc.text(`Patient: ${patientName}`, 14, 35);

      const tableRows = cart.map(item => [
        item.name, 
        item.quantity, 
        `Rs.${item.price}`, 
        `${item.discount}%`, // Show Discount in PDF
        `Rs.${item.total.toFixed(2)}`
      ]);

      autoTable(doc, {
        head: [["Item", "Qty", "Price", "Disc%", "Total"]],
        body: tableRows,
        startY: 45,
      });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.text(`Sub Total: Rs. ${cartTotal.toFixed(2)}`, 14, finalY);
      
      // If manual discount applied on total
      if(manualDiscount > 0) {
        doc.text(`Extra Discount: ${manualDiscount}%`, 14, finalY + 6);
        doc.setFontSize(16);
        doc.text(`Grand Total: Rs. ${finalBillAmount.toFixed(2)}`, 14, finalY + 14);
      } else {
        doc.setFontSize(16);
        doc.text(`Grand Total: Rs. ${finalBillAmount.toFixed(2)}`, 14, finalY + 10);
      }
      
      doc.save(`Bill_${patientName}.pdf`);
      setCart([]); setPatientName(''); setManualDiscount(0); fetchMedicines();

    } catch (error) { alert("Error: " + error.message); }
  };

  const filteredMedicines = medicines.filter(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="ml-0 md:ml-64 p-4 md:p-8 min-h-screen flex flex-col lg:flex-row gap-6">
      
      {/* Left: Select Items */}
      <div className="w-full lg:w-1/2 glass-panel p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center"><FaBoxOpen className="mr-2"/> Select Items</h2>
        
        <div className="relative mb-6">
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 pl-10 glass-input rounded-lg" />
          <FaSearch className="absolute left-3 top-4 text-gray-400"/>
        </div>

        {searchTerm && (
          <ul className="mb-6 glass-panel rounded-xl max-h-60 overflow-y-auto">
            {filteredMedicines.map(med => (
              <li key={med._id} onClick={() => { setSelectedMed(med); setSearchTerm(med.name); }} className="p-3 hover:bg-white/10 cursor-pointer border-b border-gray-700 flex justify-between items-center text-white">
                <div>
                  <span className="font-bold">{med.name}</span>
                  {/* SHOW DISCOUNT BADGE */}
                  {med.discount > 0 && <span className="ml-2 text-xs bg-green-500 text-black px-2 py-0.5 rounded font-bold">-{med.discount}% Off</span>}
                </div>
                <span className="text-xs text-gray-400">Stock: {med.quantity}</span>
              </li>
            ))}
          </ul>
        )}

        {selectedMed && (
          <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-500/30">
            <h3 className="font-bold text-xl text-blue-300">{selectedMed.name}</h3>
            <p className="text-gray-400">Price: ₹{selectedMed.price} {selectedMed.discount > 0 && <span className="text-green-400">({selectedMed.discount}% Disc applied)</span>}</p>
            <div className="flex gap-4 mt-4">
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-20 p-2 glass-input rounded-lg" />
              <button onClick={addToCart} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><FaCartPlus className="mr-2"/> Add</button>
            </div>
          </div>
        )}
      </div>

      {/* Right: Bill */}
      <div className="w-full lg:w-1/2 glass-panel p-6 rounded-xl flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center"><FaFileInvoice className="mr-2"/> Invoice</h2>
        
        {/* Patient Name */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm">Patient Name</label>
          <div className="relative">
            <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full p-2 pl-8 glass-input rounded-lg" placeholder="Name" />
            <FaUserInjured className="absolute left-2 top-3 text-gray-500"/>
          </div>
        </div>

        {/* NEW: Extra Discount Input */}
        <div className="mb-4">
          <label className="text-gray-400 text-sm">Extra Bill Discount (%)</label>
          <div className="relative">
            <input type="number" value={manualDiscount} onChange={(e) => setManualDiscount(Number(e.target.value))} className="w-full p-2 pl-8 glass-input rounded-lg" placeholder="0" />
            <FaPercentage className="absolute left-2 top-3 text-gray-500"/>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto mb-4">
          <table className="w-full text-left text-gray-300 text-sm">
            <thead className="border-b border-gray-700"><tr><th className="p-2">Item</th><th className="p-2">Qty</th><th className="p-2">Disc</th><th className="p-2">Total</th><th></th></tr></thead>
            <tbody>
              {cart.map((item, i) => (
                <tr key={i} className="border-b border-gray-800">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2 text-green-400">{item.discount}%</td>
                  <td className="p-2 text-white font-bold">₹{item.total.toFixed(0)}</td>
                  <td className="p-2"><button onClick={() => removeFromCart(i)} className="text-red-400"><FaTrash/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Total & Checkout */}
        <div className="border-t border-gray-700 pt-4">
          <div className="flex justify-between text-gray-400"><span>Sub Total:</span><span>₹ {cartTotal.toFixed(2)}</span></div>
          {manualDiscount > 0 && <div className="flex justify-between text-green-400"><span>Extra Discount:</span><span>- {manualDiscount}%</span></div>}
          <div className="flex justify-between text-2xl font-bold text-white mt-2"><span>Grand Total:</span><span>₹ {finalBillAmount.toFixed(2)}</span></div>
          <button onClick={handleCheckout} className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition">Print Bill</button>
        </div>
      </div>
    </div>
  );
};
export default Sales;