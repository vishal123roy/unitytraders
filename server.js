// server.js
import express from "express";
import dotenv from "dotenv";
import userRoutes from "./src/routes/userRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import customerRoutes from "./src/routes/customerRoutes.js";
import { connectDB } from "./src/db.js";

dotenv.config();

const app = express();

app.use(express.json()); 

app.use("/api/users", userRoutes);
app.use("/api/products",productRoutes);
app.use("/api/customers",customerRoutes);


connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});


