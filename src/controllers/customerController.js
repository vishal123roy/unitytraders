// controllers/customerController.js
import Customer from "../models/customer.js";
import cloudinary from "../config/cloudinaryConfig.js";

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
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ message: "Customer retrieved successfully", customer });
  } catch (error) {
    console.error("Error fetching customer by ID:", error);
    res.status(500).json({ message: "Server error while fetching customer" });
  }
};

// 🟢 Add new customer
export const addCustomer = async (req, res) => {
  try {
    const { customerName, mobile, point, profileImage } = req.body;

    if (!customerName || point === undefined) {
      return res.status(400).json({ message: "Customer name and points are required" });
    }

    const existingCustomer = await Customer.findOne({ customerName });
    if (existingCustomer) {
      return res.status(400).json({ message: "Customer with this name already exists" });
    }

    let imageUrl = null;

    // Upload profile image to Cloudinary if provided
    if (profileImage) {
      try {
        const result = await cloudinary.uploader.upload(profileImage, {
          folder: "customer_profiles",
          resource_type: "image",
          transformation: [
            { width: 500, height: 500, crop: "limit" },
            { quality: "auto" },
          ],
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        return res.status(500).json({ 
          message: "Profile image upload failed", 
          error: uploadError.message 
        });
      }
    }

    const newCustomer = new Customer({ 
      customerName, 
      mobile, 
      point, 
      profileImage: imageUrl 
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

// 🟢 Update profile image
export const updateUserProfileImage = async (req, res) => {
  try {
    const { userId } = req.params;
    const { profileImage } = req.body;

    if (!profileImage) {
      return res.status(400).json({ message: "Profile image is required" });
    }

    const customer = await Customer.findById(userId);
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    try {
      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(profileImage, {
        folder: "customer_profiles",
        resource_type: "image",
        transformation: [
          { width: 500, height: 500, crop: "limit" },
          { quality: "auto" },
        ],
      });

      const newImageUrl = result.secure_url;

      // Delete old image from Cloudinary if exists
      if (customer.profileImage) {
        try {
          const urlParts = customer.profileImage.split('/');
          const publicIdWithExt = urlParts[urlParts.length - 1];
          const publicId = `customer_profiles/${publicIdWithExt.split('.')[0]}`;
          
          await cloudinary.uploader.destroy(publicId);
        } catch (deleteError) {
          console.error("Error deleting old profile image:", deleteError);
          // Continue even if old image deletion fails
        }
      }

      customer.profileImage = newImageUrl;
      await customer.save();

      res.status(200).json({ 
        success: true,
        message: "Profile image updated successfully", 
        customer 
      });
    } catch (uploadError) {
      return res.status(500).json({ 
        message: "Image upload failed", 
        error: uploadError.message 
      });
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
    
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // Delete profile image from Cloudinary if exists
    if (customer.profileImage) {
      try {
        const urlParts = customer.profileImage.split('/');
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = `customer_profiles/${publicIdWithExt.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.error("Error deleting customer profile image:", deleteError);
        // Continue with customer deletion even if image deletion fails
      }
    }

    await Customer.findByIdAndDelete(userId);
    res.status(200).json({ message: "Customer removed successfully" });
  } catch (error) {
    console.error("Error removing customer:", error);
    res.status(500).json({ message: "Server error while removing customer" });
  }
};