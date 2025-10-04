import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: false,
    },
    point: {
      type: Number,
      required: true,
      default: 0,
    },
    profileImage: {
      type: String, 
      required: false,
      default: "",  
    },
  },
  { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
