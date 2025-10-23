// models/CustomerSchemeProgress.js
import mongoose from "mongoose";

const customerSchemeProgress = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
  scheme: { type: mongoose.Schema.Types.ObjectId, ref: "Scheme", required: true },
  earnedPoints: { type: Number, default: 0 }, // total earned (allocated)   // consumed by redemptions
  achievedSlabs: [{ // list of redeemed slab levels
    level: Number,
    redeemedAt: Date
  }],
  // optional: for monthly schemes you may want to store the period it belongs to,
  // but here we keep a single doc per customer+scheme and reset usedPoints only when needed
  
}, { timestamps: true });

customerSchemeProgress.index({ customer: 1, scheme: 1 }, { unique: true });

export default mongoose.model("CustomerSchemeProgress", customerSchemeProgress);
