const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------
// 1. MONGODB DATABASE CONNECTION
// ---------------------------------------------------------
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected Successfully (Cloud)");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};
connectDB();

// ---------------------------------------------------------
// 2. DATABASE MODELS (SCHEMAS)
// ---------------------------------------------------------

// A. Inventory Model (Added 'discount')
const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 }, // <-- NEW: Default Discount %
}, { timestamps: true });

const Medicine = mongoose.model("Medicine", MedicineSchema);

// B. Sales Model (Added 'discountGiven')
const SalesSchema = new mongoose.Schema({
  invoiceId: { type: String, required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
  medicineName: { type: String },
  patientName: { type: String },
  quantitySold: { type: Number, required: true },
  pricePerUnit: { type: Number }, 
  discountGiven: { type: Number, default: 0 }, // <-- NEW
  totalAmount: { type: Number, required: true },
  saleDate: { type: Date, default: Date.now },
});

const Sale = mongoose.model("Sale", SalesSchema);

// C. Demand Model
const DemandSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  noteDate: { type: Date, default: Date.now }
});
const Demand = mongoose.model("Demand", DemandSchema);


// ---------------------------------------------------------
// 3. API ROUTES (INVENTORY & DEMAND)
// ---------------------------------------------------------

// Add Medicine
app.post("/api/medicine/add", async (req, res) => {
  try {
    const newMedicine = new Medicine(req.body);
    const savedMedicine = await newMedicine.save();
    
    // Auto-remove from Demand list
    await Demand.findOneAndDelete({ medicineName: { $regex: new RegExp(req.body.name, "i") } });

    res.status(201).json(savedMedicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Medicines
app.get("/api/medicine/all", async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Medicine
app.put("/api/medicine/update/:id", async (req, res) => {
  try {
    const updatedMedicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedMedicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Medicine
app.delete("/api/medicine/delete/:id", async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: "Medicine Deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Demand List APIs
app.post("/api/demand/add", async (req, res) => {
  try {
    const { medicineName } = req.body;
    // Check Stock
    const existingMedicine = await Medicine.findOne({ 
      name: { $regex: new RegExp(medicineName, "i") },
      quantity: { $gt: 0 } 
    });

    if (existingMedicine) {
      return res.status(400).json({ error: `⚠️ Medicine already in Stock! (Qty: ${existingMedicine.quantity})` });
    }

    const newDemand = new Demand(req.body);
    await newDemand.save();
    res.status(201).json(newDemand);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/api/demand/all", async (req, res) => {
  try {
    const demands = await Demand.find().sort({ noteDate: -1 });
    res.json(demands);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete("/api/demand/delete/:id", async (req, res) => {
  try {
    await Demand.findByIdAndDelete(req.params.id);
    res.json({ message: "Removed" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});


// ---------------------------------------------------------
// 4. API ROUTES (SALES, RETURNS & DASHBOARD)
// ---------------------------------------------------------

// Create Sale (With Discount Calculation)
app.post("/api/sales/add", async (req, res) => {
  try {
    const { medicineId, quantity, patientName, invoiceId, discount } = req.body;

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) return res.status(404).json({ error: "Medicine not found" });

    if (medicine.quantity < quantity) {
      return res.status(400).json({ error: `Insufficient Stock for ${medicine.name}` });
    }

    // Deduct Stock
    medicine.quantity -= quantity;
    await medicine.save();

    // Calculate Price with Discount
    const basePrice = medicine.price * quantity;
    const discountAmount = (basePrice * (discount || 0)) / 100;
    const finalAmount = basePrice - discountAmount;

    const newSale = new Sale({
      invoiceId,
      medicineId,
      medicineName: medicine.name,
      patientName: patientName || "Walk-in",
      quantitySold: quantity,
      pricePerUnit: medicine.price,
      discountGiven: discount || 0,
      totalAmount: finalAmount
    });
    
    await newSale.save();
    res.status(201).json(newSale);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Sales History
app.get("/api/sales/history", async (req, res) => {
  try {
    const history = await Sale.find().sort({ saleDate: -1 });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Return Logic
app.post("/api/sales/return", async (req, res) => {
  try {
    const { saleId, returnQty } = req.body;

    const saleRecord = await Sale.findById(saleId);
    if (!saleRecord) return res.status(404).json({ error: "Record not found" });

    if (returnQty > saleRecord.quantitySold) {
      return res.status(400).json({ error: "Cannot return more than sold quantity" });
    }

    // Restore Stock
    const medicine = await Medicine.findById(saleRecord.medicineId);
    if (medicine) {
      medicine.quantity += parseInt(returnQty);
      await medicine.save();
    }

    // Calculate Refund based on actual sold price (considering discount)
    const effectivePricePerUnit = saleRecord.totalAmount / saleRecord.quantitySold;
    const refundAmount = effectivePricePerUnit * returnQty;
    
    if (parseInt(returnQty) === saleRecord.quantitySold) {
      await Sale.findByIdAndDelete(saleId);
    } else {
      saleRecord.quantitySold -= returnQty;
      saleRecord.totalAmount -= refundAmount;
      if (!saleRecord.invoiceId) saleRecord.invoiceId = `OLD-${saleRecord._id}`;
      await saleRecord.save();
    }

    res.json({ message: "Return Successful", refundAmount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard APIs
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const medicines = await Medicine.find();
    const totalStockValue = medicines.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const lowStockItems = medicines.filter(item => item.quantity < 40).length;
    const today = new Date();
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);
    const expiringSoon = medicines.filter(item => {
      const expDate = new Date(item.expiryDate);
      return expDate >= today && expDate <= next30Days;
    }).length;

    res.json({ totalStockValue, lowStockItems, expiringSoon, totalMedicines: medicines.length });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/api/medicine/low-stock-list", async (req, res) => {
  const list = await Medicine.find({ quantity: { $lt: 40 } });
  res.json(list);
});
app.get("/api/medicine/expiring-soon-list", async (req, res) => {
  const today = new Date(); const next30Days = new Date(); next30Days.setDate(today.getDate() + 30);
  const list = await Medicine.find({ expiryDate: { $gte: today, $lte: next30Days } });
  res.json(list);
});
app.get("/api/sales/chart", async (req, res) => {
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sales = await Sale.aggregate([
    { $match: { saleDate: { $gte: sevenDaysAgo } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } }, totalSales: { $sum: "$totalAmount" } } },
    { $sort: { _id: 1 } }
  ]);
  res.json(sales);
});

app.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));