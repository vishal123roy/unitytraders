// models/Scheme.js
import mongoose from "mongoose";

const slabSchema = new mongoose.Schema({
  level: { type: Number, required: true },
  targetPoint: { type: Number, required: true },
  gift: { type: String, default: "" },
});

const schemeSchema = new mongoose.Schema({
  schemeName: { type: String, required: true, trim: true },
  duration: {
    from: { type: Date, required: true },
    to: { type: Date, required: true },
  },
  schemeType: { type: String, enum: ["monthly", "annual", "special"], required: true },
  maxPoint: { type: Number, required: true },
  gift: { type: String, default: "" },
  slabs: [slabSchema],
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Scheme", schemeSchema);
