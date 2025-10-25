// controllers/customerController.js
import Customer from "../models/customer.js";
import cloudinary from "../config/cloudinaryConfig.js";
import { Readable } from "stream";

// Helper: convert buffer to readable stream
const bufferToStream = (buffer) => {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
};

// 🟢 Get all customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    if (!customers.length) {
      return res.status(404).json({ message: "No customers found" });
    }
    res.status(200).json({ message: "Customers retrieved successfully", customers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ message: "Server error while fetching customers" });
  }
};

// 🟢 Get customer by ID
export const getCustomerById = async (req, res) => {
  try {
    const { userId } = req.params;
    const customer = await Customer.findById(userId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.status(200).json({ message: "Customer retrieved successfully", customer });
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    res.status(500).json({ message: "Server error while fetching customer" });
  }
};

// 🟢 Add new customer (FormData support)
export const addCustomer = async (req, res) => {
  try {
    console.log(req.file,'llllllllllllllllllll');
    const { customerName, mobile, point } = req.body;

    if (!customerName || point === undefined) {
      return res.status(400).json({ message: "Customer name and points are required" });
    }

    const existingCustomer = await Customer.findOne({ customerName });
    if (existingCustomer) {
      return res.status(400).json({ message: "Customer with this name already exists" });
    }

    let imageUrl = null;

    // Upload profile image to Cloudinary if provided as file
    if (req.file && req.file.buffer) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: "customer_profiles",
              resource_type: "image",
              transformation: [
                { width: 500, height: 500, crop: "limit" },
                { quality: "auto" },
              ],
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          bufferToStream(req.file.buffer).pipe(uploadStream);
        });

        imageUrl = result.secure_url;
      } catch (uploadError) {
        return res.status(500).json({
          message: "Profile image upload failed",
          error: uploadError.message,
        });
      }
    }

    const newCustomer = new Customer({
      customerName,
      mobile,
      point,
      profileImage: imageUrl,
    });

    await newCustomer.save();
    res.status(201).json({ message: "Customer added successfully", customer: newCustomer });
  } catch (error) {
    console.error("Error adding customer:", error);
    res.status(500).json({ message: "Server error while adding customer" });
  }
};

// 🟢 Edit customer details (name, mobile, point only)
export const editCustomerDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { customerName, mobile, point } = req.body;

    const customer = await Customer.findById(userId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    if (customerName) customer.customerName = customerName;
    if (mobile) customer.mobile = mobile;
    if (point !== undefined) customer.point = point;

    await customer.save();
    res.status(200).json({ message: "Customer details updated successfully", customer });
  } catch (error) {
    console.error("Error updating customer details:", error);
    res.status(500).json({ message: "Server error while updating customer" });
  }
};

// 🟢 Update profile image (FormData)
export const updateUserProfileImage = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "Profile image file is required" });
    }

    const customer = await Customer.findById(userId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    try {
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "customer_profiles",
            resource_type: "image",
            transformation: [
              { width: 500, height: 500, crop: "limit" },
              { quality: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        bufferToStream(req.file.buffer).pipe(uploadStream);
      });

      const newImageUrl = result.secure_url;

      // Delete old image if exists
      if (customer.profileImage) {
        try {
          const urlParts = customer.profileImage.split("/");
          const publicIdWithExt = urlParts[urlParts.length - 1];
          const publicId = `customer_profiles/${publicIdWithExt.split(".")[0]}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (deleteError) {
          console.error("Error deleting old profile image:", deleteError);
        }
      }

      customer.profileImage = newImageUrl;
      await customer.save();

      res.status(200).json({
        success: true,
        message: "Profile image updated successfully",
        customer,
      });
    } catch (uploadError) {
      return res.status(500).json({ message: "Image upload failed", error: uploadError.message });
    }
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ message: "Server error while updating profile image" });
  }
};

// 🟢 Remove customer
export const removeCustomer = async (req, res) => {
  try {
    const { userId } = req.params;
    const customer = await Customer.findById(userId);

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    if (customer.profileImage) {
      try {
        const urlParts = customer.profileImage.split("/");
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = `customer_profiles/${publicIdWithExt.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.error("Error deleting customer profile image:", deleteError);
      }
    }

    await Customer.findByIdAndDelete(userId);
    res.status(200).json({ message: "Customer removed successfully" });
  } catch (error) {
    console.error("Error removing customer:", error);
    res.status(500).json({ message: "Server error while removing customer" });
  }
};
