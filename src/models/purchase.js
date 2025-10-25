// models/Purchase.js
import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  date: { type: Date, required: true },
  productList: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      count: { type: Number, default: 1, required: true },
    }
  ],
  totalPoints: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model("Purchase", purchaseSchema);
