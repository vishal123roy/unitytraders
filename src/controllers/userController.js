// controllers/userController.js
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import cloudinary from "../config/cloudinaryConfig.js";

// Register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !mobile || !password || !email) {
      return res.status(400).json({ message: "Name, Email, Mobile, and Password are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { mobile }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this email or mobile" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      isAdmin: false, // default
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully", 
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ message: "Mobile and Password are required" });
    }

    const user = await User.findOne({ mobile });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        isAdmin: user.isAdmin,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Edit user (excluding profileImage)
export const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, password } = req.body;

    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (mobile) updateData.mobile = mobile;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        isAdmin: updatedUser.isAdmin,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error) {
    console.error("Edit User Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update profile image separately using Cloudinary
export const updateProfileImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { profileImage } = req.body; // base64 string from Flutter

    if (!profileImage) {
      return res.status(400).json({ message: "No image provided" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      // Upload base64 string directly to Cloudinary
      const result = await cloudinary.uploader.upload(profileImage, {
        folder: "profile_images",
        resource_type: "image",
        transformation: [
          { width: 500, height: 500, crop: "limit" },
          { quality: "auto" },
        ],
      });

      const newImageUrl = result.secure_url;

      // Delete old image if exists
      if (user.profileImage) {
        try {
          const urlParts = user.profileImage.split('/');
          const publicIdWithExt = urlParts[urlParts.length - 1];
          const publicId = `profile_images/${publicIdWithExt.split('.')[0]}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (deleteError) {
          console.error("Error deleting old profile image:", deleteError);
        }
      }

      // Update user with new image URL
      user.profileImage = newImageUrl;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile image updated successfully",
        profileImage: user.profileImage,
      });
    } catch (uploadError) {
      return res.status(500).json({
        message: "Image upload failed",
        error: uploadError.message,
      });
    }
  } catch (error) {
    console.error("Update Profile Image Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
