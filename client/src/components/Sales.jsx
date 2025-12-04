import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 
import { FaCartPlus, FaTrash, FaFileInvoice, FaSearch, FaBoxOpen, FaUserInjured, FaPercentage } from 'react-icons/fa';
import { toast } from 'react-toastify'; 

const Sales = () => {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedMed, setSelectedMed] = useState(null);
  const [patientName, setPatientName] = useState('');
  const [manualDiscount, setManualDiscount] = useState(0);

  const fetchMedicines = async () => {
    try { const res = await axios.get('https://medicaldashboard-2556.onrender.com/api/medicine/all'); setMedicines(res.data); } 
    catch (error) { console.error("Error:", error); }
  };
  useEffect(() => { fetchMedicines(); }, []);

  const addToCart = () => {
    if (!selectedMed) return toast.warning("Please select a medicine first!");
    if (quantity <= 0) return toast.warning("Quantity must be valid!");
    if (selectedMed.quantity < quantity) return toast.error(`Only ${selectedMed.quantity} items in stock!`);
    if (cart.find(item => item.id === selectedMed._id)) return toast.info("Item already added to cart!");

    const unitPrice = selectedMed.price;
    const itemDiscount = selectedMed.discount || 0; 
    const finalUnitTestPrice = unitPrice - (unitPrice * itemDiscount / 100);

    const newItem = {
      id: selectedMed._id, name: selectedMed.name, price: unitPrice, discount: itemDiscount,
      quantity: parseInt(quantity), total: finalUnitTestPrice * parseInt(quantity)
    };

    setCart([...cart, newItem]);
    toast.success(`${selectedMed.name} added to cart`);
    setSelectedMed(null); setQuantity(1); setSearchTerm('');
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
    toast.info("Item removed");
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);
  const finalBillAmount = cartTotal - (cartTotal * manualDiscount / 100);

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Cart is empty!");
    if (!patientName.trim()) return toast.warning("Please enter Patient Name!");

    const storeName = localStorage.getItem('storeName') || "Medical Store";
    const invoiceId = `INV-${Date.now()}`;

    try {
      for (const item of cart) {
        await axios.post('https://medicaldashboard-2556.onrender.com/api/sales/add', {
          invoiceId, medicineId: item.id, quantity: item.quantity, patientName, discount: item.discount 
        });
      }

      toast.success('🎉 Sale Complete! Bill Downloaded.');
      
      const doc = new jsPDF();
      doc.setFontSize(22); doc.setTextColor(40); doc.text(storeName, 14, 20);
      doc.setFontSize(10); doc.setTextColor(0); doc.text(`Invoice: ${invoiceId}`, 14, 30);
      doc.text(`Patient: ${patientName}`, 14, 35); doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 40);

      const tableRows = cart.map(item => [item.name, item.quantity, `Rs.${item.price}`, `${item.discount}%`, `Rs.${item.total.toFixed(2)}`]);
      autoTable(doc, { head: [["Item", "Qty", "Price", "Disc%", "Total"]], body: tableRows, startY: 50 });

      const finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(12); doc.text(`Sub Total: Rs. ${cartTotal.toFixed(2)}`, 14, finalY);
      if(manualDiscount > 0) { doc.text(`Extra Discount: ${manualDiscount}%`, 14, finalY + 6); doc.setFontSize(16); doc.text(`Grand Total: Rs. ${finalBillAmount.toFixed(2)}`, 14, finalY + 14); } 
      else { doc.setFontSize(16); doc.text(`Grand Total: Rs. ${finalBillAmount.toFixed(2)}`, 14, finalY + 10); }
      
      doc.save(`${storeName}_Bill_${patientName}.pdf`);
      setCart([]); setPatientName(''); setManualDiscount(0); fetchMedicines();

    } catch (error) { toast.error("Error: " + error.message); }
  };

  const filteredMedicines = medicines.filter(med => med.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-4 md:p-8 min-h-screen flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-1/2 glass-panel p-6 rounded-xl border border-blue-500/20">
         <h2 className="text-2xl font-bold text-white mb-4 flex items-center"><FaBoxOpen className="mr-2 text-blue-400"/> Select Items</h2>
         <div className="relative mb-6"><input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 pl-10 glass-input rounded-lg text-white" /><FaSearch className="absolute left-3 top-4 text-gray-400"/></div>
         {searchTerm && (<ul className="mb-6 glass-panel rounded-xl max-h-60 overflow-y-auto border border-gray-700">{filteredMedicines.map(med => (<li key={med._id} onClick={() => { setSelectedMed(med); setSearchTerm(med.name); }} className="p-3 hover:bg-white/10 cursor-pointer border-b border-gray-700 flex justify-between items-center text-white"><div><span className="font-bold">{med.name}</span></div><span className="text-xs text-gray-400">Qty: {med.quantity}</span></li>))}</ul>)}
         {selectedMed && (<div className="bg-blue-900/30 p-4 rounded-xl border border-blue-500/30"><h3 className="font-bold text-xl text-blue-300">{selectedMed.name}</h3><div className="flex gap-4 mt-4"><input type="number" min="1" max={selectedMed.quantity} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-20 p-2 glass-input rounded-lg text-white" /><button onClick={addToCart} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"><FaCartPlus className="mr-2"/> Add</button></div></div>)}
      </div>
      <div className="w-full lg:w-1/2 glass-panel p-6 rounded-xl flex flex-col border border-green-500/20">
         <h2 className="text-2xl font-bold text-white mb-4 flex items-center"><FaFileInvoice className="mr-2 text-green-400"/> Invoice</h2>
         <div className="mb-4"><input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} className="w-full p-2 pl-9 glass-input rounded-lg text-white" placeholder="Patient Name" /><FaUserInjured className="absolute left-9 top-[90px] text-gray-500"/></div>
         <div className="mb-4"><input type="number" value={manualDiscount} onChange={(e) => setManualDiscount(Number(e.target.value))} className="w-full p-2 pl-9 glass-input rounded-lg text-white" placeholder="Extra Discount %" /></div>
         <div className="flex-1 overflow-auto mb-4 bg-black/20 rounded-lg p-2 custom-scrollbar max-h-[300px]"><table className="w-full text-left text-gray-300 text-sm"><thead><tr><th>Item</th><th>Qty</th><th>Total</th><th></th></tr></thead><tbody>{cart.map((item, i) => (<tr key={i} className="border-b border-gray-800"><td className="p-2 text-white">{item.name}</td><td className="p-2">{item.quantity}</td><td className="p-2 text-white">₹{item.total.toFixed(0)}</td><td className="p-2"><button onClick={() => removeFromCart(i)} className="text-red-400"><FaTrash/></button></td></tr>))}</tbody></table></div>
         <div className="border-t border-gray-700 pt-4 mt-auto"><div className="flex justify-between text-3xl font-bold text-white mt-2 mb-4"><span>Total:</span><span>₹ {finalBillAmount.toFixed(0)}</span></div><button onClick={handleCheckout} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold">Print Bill & Save</button></div>
      </div>
    </div>
  );
};
export default Sales;