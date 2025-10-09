import Customer from "../models/customer.js";

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
    const { customerName, mobile, point } = req.body;

    if (!customerName || point === undefined) {
      return res.status(400).json({ message: "Customer name and points are required" });
    }

    const existingCustomer = await Customer.findOne({ customerName });
    if (existingCustomer) {
      return res.status(400).json({ message: "Customer with this name already exists" });
    }

    const profileImage = req.file ? req.file.path : "";

    const newCustomer = new Customer({ customerName, mobile, point, profileImage });
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

    if (!req.file) {
      return res.status(400).json({ message: "Profile image file is required" });
    }

    const updatedUser = await Customer.findByIdAndUpdate(
      userId,
      { profileImage: req.file.path },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ message: "Customer not found" });

    res.status(200).json({ message: "Profile image updated successfully", customer: updatedUser });
  } catch (error) {
    console.error("Error updating profile image:", error);
    res.status(500).json({ message: "Server error while updating profile image" });
  }
};

// 🟢 Remove customer
export const removeCustomer = async (req, res) => {
  try {
    const { userId } = req.params;
    const customer = await Customer.findByIdAndDelete(userId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    // If profileImage exists, you may delete local file here if needed
    // e.g., fs.unlink(customer.profileImage)

    res.status(200).json({ message: "Customer removed successfully" });
  } catch (error) {
    console.error("Error removing customer:", error);
    res.status(500).json({ message: "Server error while removing customer" });
  }
};
