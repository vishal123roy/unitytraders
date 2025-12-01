import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./src/routes/userRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import customerRoutes from "./src/routes/customerRoutes.js";
import purchaseRoutes from "./src/routes/purchaseRoutes.js";
import schemeRoutes from "./src/routes/schemeRoutes.js";
import { connectDB } from "./src/db.js";
import customerSchemeRoutes from "./src/routes/customerSchemeRoutes.js";
import homeRoutes from "./src/routes/homeRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// ✅ Increase upload size limits (to prevent 413 Payload Too Large)
app.use(express.json({ limit: "10mb" })); // 🔥 allow JSON up to 10MB
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // allow URL-encoded up to 10MB

// ✅ If using multer or base64 images, increase also in multer config separately
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customer-routes", customerRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/customers", customerSchemeRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/home", homeRoutes);

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
