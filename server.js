import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./src/routes/userRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import customerRoutes from "./src/routes/customerRoutes.js";
import purchaseRoutes from "./src/routes/purchaseRoutes.js"
import schemeRoutes from "./src/routes/schemeRoutes.js"
import { connectDB } from "./src/db.js";
import customerSchemeRoutes from './src/routes/customerSchemeRoutes.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoutes);

app.use("/api/products",productRoutes);
app.use("/api/customer-routes",customerRoutes);
app.use("/api/purchases",purchaseRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerSchemeRoutes);

app.use("/api/schemes",schemeRoutes);

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});