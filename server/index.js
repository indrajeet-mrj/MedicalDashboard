const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123"; // Secret Key

app.use(cors());
app.use(express.json());

// DB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.log("❌ DB Error:", error);
    process.exit(1);
  }
};
connectDB();

// ---------------------------------------------------------
// 1. MODELS (USER Added & Others Updated)
// ---------------------------------------------------------

// A. USER MODEL (Store Owner)
const UserSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

// B. INVENTORY MODEL (Linked to User)
const MedicineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // <-- Owner Link
  name: { type: String, required: true },
  category: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, default: 0 },
}, { timestamps: true });
const Medicine = mongoose.model("Medicine", MedicineSchema);

// C. SALES MODEL (Linked to User)
const SalesSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // <-- Owner Link
  invoiceId: { type: String, required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
  medicineName: { type: String },
  patientName: { type: String },
  quantitySold: { type: Number, required: true },
  pricePerUnit: { type: Number }, 
  discountGiven: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  saleDate: { type: Date, default: Date.now },
});
const Sale = mongoose.model("Sale", SalesSchema);

// D. DEMAND MODEL (Linked to User)
const DemandSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // <-- Owner Link
  medicineName: { type: String, required: true },
  noteDate: { type: Date, default: Date.now }
});
const Demand = mongoose.model("Demand", DemandSchema);


// ---------------------------------------------------------
// 2. MIDDLEWARE (Suraksha Guard)
// ---------------------------------------------------------
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ error: "Access Denied! Login First." });

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // User ID request mein jod di
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

// ---------------------------------------------------------
// 3. AUTH ROUTES (Login / Register)
// ---------------------------------------------------------

app.post("/api/auth/register", async (req, res) => {
  try {
    const { storeName, email, password } = req.body;
    
    // Check Email
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered!" });

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ storeName, email, password: hashedPassword });
    await newUser.save();
    
    res.status(201).json({ message: "Store Registered Successfully! Please Login." });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Email not found!" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: "Wrong Password!" });

    // Create Token
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ token, storeName: user.storeName, email: user.email });
  } catch (error) { res.status(500).json({ error: error.message }); }
});


// ---------------------------------------------------------
// 4. PROTECTED DATA ROUTES (Har jagah userId check hoga)
// ---------------------------------------------------------

// --- INVENTORY ---
app.post("/api/medicine/add", authMiddleware, async (req, res) => {
  try {
    const newMedicine = new Medicine({ ...req.body, userId: req.user.id });
    await newMedicine.save();
    // Auto-remove from Demand
    await Demand.findOneAndDelete({ userId: req.user.id, medicineName: { $regex: new RegExp(req.body.name, "i") } });
    res.status(201).json(newMedicine);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/api/medicine/all", authMiddleware, async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.user.id }); // Sirf apna data
    res.json(medicines);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put("/api/medicine/update/:id", authMiddleware, async (req, res) => {
  try {
    await Medicine.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body);
    res.json({ message: "Updated" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete("/api/medicine/delete/:id", authMiddleware, async (req, res) => {
  try {
    await Medicine.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ message: "Deleted" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- DEMAND ---
app.post("/api/demand/add", authMiddleware, async (req, res) => {
  try {
    const { medicineName } = req.body;
    const existing = await Medicine.findOne({ userId: req.user.id, name: { $regex: new RegExp(medicineName, "i") }, quantity: { $gt: 0 } });
    if (existing) return res.status(400).json({ error: "Already in Stock!" });

    const newDemand = new Demand({ medicineName, userId: req.user.id });
    await newDemand.save();
    res.status(201).json(newDemand);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/api/demand/all", authMiddleware, async (req, res) => {
  const demands = await Demand.find({ userId: req.user.id }).sort({ noteDate: -1 });
  res.json(demands);
});

app.delete("/api/demand/delete/:id", authMiddleware, async (req, res) => {
  await Demand.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  res.json({ message: "Deleted" });
});

// --- SALES ---
app.post("/api/sales/add", authMiddleware, async (req, res) => {
  try {
    const { medicineId, quantity, patientName, invoiceId, discount } = req.body;
    const medicine = await Medicine.findOne({ _id: medicineId, userId: req.user.id });
    if (!medicine) return res.status(404).json({ error: "Medicine not found" });

    if (medicine.quantity < quantity) return res.status(400).json({ error: "Low Stock" });

    medicine.quantity -= quantity;
    await medicine.save();

    const basePrice = medicine.price * quantity;
    const finalAmount = basePrice - ((basePrice * (discount || 0)) / 100);

    const newSale = new Sale({
      userId: req.user.id,
      invoiceId, medicineId, medicineName: medicine.name, patientName: patientName || "Walk-in",
      quantitySold: quantity, pricePerUnit: medicine.price, discountGiven: discount || 0, totalAmount: finalAmount
    });
    await newSale.save();
    res.status(201).json(newSale);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/api/sales/history", authMiddleware, async (req, res) => {
  const history = await Sale.find({ userId: req.user.id }).sort({ saleDate: -1 });
  res.json(history);
});

app.post("/api/sales/return", authMiddleware, async (req, res) => {
  try {
    const { saleId, returnQty } = req.body;
    const saleRecord = await Sale.findOne({ _id: saleId, userId: req.user.id });
    if (!saleRecord) return res.status(404).json({ error: "Record not found" });

    const medicine = await Medicine.findOne({ _id: saleRecord.medicineId, userId: req.user.id });
    if (medicine) {
      medicine.quantity += parseInt(returnQty);
      await medicine.save();
    }
    
    // Simple refund calculation for demo
    let price = saleRecord.pricePerUnit || (saleRecord.totalAmount / saleRecord.quantitySold);
    const refundAmount = price * returnQty;

    if (parseInt(returnQty) === saleRecord.quantitySold) {
      await Sale.findByIdAndDelete(saleId);
    } else {
      saleRecord.quantitySold -= returnQty;
      saleRecord.totalAmount -= refundAmount;
      await saleRecord.save();
    }
    res.json({ message: "Return Successful", refundAmount });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- DASHBOARD ---
app.get("/api/dashboard/stats", authMiddleware, async (req, res) => {
  try {
    const medicines = await Medicine.find({ userId: req.user.id });
    const totalStockValue = medicines.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const lowStockItems = medicines.filter(item => item.quantity < 40).length;
    const today = new Date(); const next30 = new Date(); next30.setDate(today.getDate() + 30);
    const expiringSoon = medicines.filter(item => new Date(item.expiryDate) >= today && new Date(item.expiryDate) <= next30).length;
    res.json({ totalStockValue, lowStockItems, expiringSoon, totalMedicines: medicines.length });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/api/medicine/low-stock-list", authMiddleware, async (req, res) => {
  const list = await Medicine.find({ userId: req.user.id, quantity: { $lt: 40 } });
  res.json(list);
});
app.get("/api/medicine/expiring-soon-list", authMiddleware, async (req, res) => {
  const today = new Date(); const next30 = new Date(); next30.setDate(today.getDate() + 30);
  const list = await Medicine.find({ userId: req.user.id, expiryDate: { $gte: today, $lte: next30 } });
  res.json(list);
});
app.get("/api/sales/chart", authMiddleware, async (req, res) => {
  const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sales = await Sale.aggregate([
    { $match: { saleDate: { $gte: sevenDaysAgo }, userId: new mongoose.Types.ObjectId(req.user.id) } }, // Aggregation mein ID object banana padta hai
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } }, totalSales: { $sum: "$totalAmount" } } },
    { $sort: { _id: 1 } }
  ]);
  res.json(sales);
});

app.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));