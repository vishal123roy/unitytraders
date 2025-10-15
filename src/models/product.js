// models/product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  unit: { type: String, required: true },
  point: { type: Number, required: true },
  productImage: { type: String, default: null }, 
}, { timestamps: true });

productSchema.index({productName:1,unit:1},{unique:true});

export default mongoose.model("Product", productSchema);
