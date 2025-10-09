import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true, 
      lowercase: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    profileImage: {
      type: String, 
      default: "",
    },
    isAdmin: {
      type: Boolean,
      default: false, // Regular users are false by default
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
