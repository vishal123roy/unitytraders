// controllers/productController.js
import Product from "../models/product.js";
import fs from "fs";

// 🟢 Get all products
export const getProduct = async (req, res) => {
  try {
    const products = await Product.find();
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Add product (with optional image)
export const addProduct = async (req, res) => {
  try {
    const { productName, unit, point } = req.body;
    console.log(productName,unit,point)
    const productImage = req.file ? req.file.path : null;

    if (!productName || !unit || !point) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingProduct = await Product.findOne({ productName, unit });
    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const newProduct = new Product({
      productName,
      unit,
      point,
      productImage, // ✅ Store the image path
    });

    await newProduct.save();
    res.status(201).json({ success: true, newProduct });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟡 Edit product (name, unit, point)
export const editProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { newName, newUnit, newPoint } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.productName = newName || product.productName;
    product.unit = newUnit || product.unit;
    product.point = newPoint || product.point;

    await product.save();
    res.status(200).json({ message: "Product updated", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🔴 Remove product
export const removeProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete old image file if exists
    if (product.productImage && fs.existsSync(product.productImage)) {
      fs.unlinkSync(product.productImage);
    }

    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟣 Separate API to update only the image
export const updateProductImage = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Delete old image if exists
    if (product.productImage && fs.existsSync(product.productImage)) {
      fs.unlinkSync(product.productImage);
    }

    product.productImage = req.file.path;
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product image updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
