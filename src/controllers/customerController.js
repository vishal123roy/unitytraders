import Customer from "../models/customer.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinaryConfig.js"; // Use configured instance

// 🧩 Multer + Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "customers", // Cloudinary folder
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

export const upload = multer({ storage });

// 🟢 Get all customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    if (!customers.length) {
      return res.status(404).json({ message: "No customers found" });
    }
    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Add new customer
export const addCustomer = async (req, res) => {
  try {
    const { customerName, mobile, point } = req.body;

    if (!customerName || point === undefined) {
      return res.status(400).json({ message: "Customer name and points are required" });
    }

    const existingCustomer = await Customer.findOne({ customerName });
    if (existingCustomer) {
      return res.status(400).json({ message: "Customer already exists" });
    }

    const profileImage = req.file ? req.file.path : "";

    const newCustomer = new Customer({
      customerName,
      mobile,
      point,
      profileImage,
    });

    await newCustomer.save();
    res.status(201).json({ success: true, customer: newCustomer });
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Edit customer
export const editCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, mobile, point } = req.body;

    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // Replace image if uploaded
    if (req.file) {
      if (customer.profileImage) {
        const publicId = customer.profileImage.split("/").slice(-1)[0].split(".")[0];
        await cloudinary.uploader.destroy(`customers/${publicId}`);
      }
      customer.profileImage = req.file.path;
    }

    if (customerName) customer.customerName = customerName;
    if (mobile) customer.mobile = mobile;
    if (point) customer.point = point;

    await customer.save();
    res.status(200).json({ message: "Customer updated", customer });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟢 Remove customer
export const removeCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    if (customer.profileImage) {
      const publicId = customer.profileImage.split("/").slice(-1)[0].split(".")[0];
      await cloudinary.uploader.destroy(`customers/${publicId}`);
    }

    res.status(200).json({ message: "Customer removed" });
  } catch (error) {
    console.error("Error removing customer:", error);
    res.status(500).json({ message: "Server error" });
  }
};
