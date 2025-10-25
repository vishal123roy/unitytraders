import Product from "../models/product.js";
import cloudinary from "../config/cloudinaryConfig.js";
import { Readable } from "stream";

// 🟢 Get all products
export const getProduct = async (req, res) => {
  try {
    const products = await Product.find();
    if (!products.length) {
      return res.status(404).json({ message: "No products found" });
    }
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟢 Add product (image as Base64 string)
export const addProduct = async (req, res) => {
  try {
    const { productName, unit, point, productImage } = req.body;

    if (!productName || !unit || !point) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingProduct = await Product.findOne({ productName, unit });
    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists" });
    }

    let imageUrl = null;

    if (productImage) {
      try {
        const buffer = Buffer.from(productImage, "base64");
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "products", resource_type: "image" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          Readable.from(buffer).pipe(uploadStream);
        });
        imageUrl = result.secure_url;
      } catch (uploadError) {
        return res.status(500).json({
          message: "Image upload failed",
          error: uploadError.message,
        });
      }
    }

    const newProduct = new Product({ productName, unit, point, productImage: imageUrl });
    await newProduct.save();

    res.status(201).json({ success: true, newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟡 Edit product (without image)
export const editProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { newName, newUnit, newPoint } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.productName = newName || product.productName;
    product.unit = newUnit || product.unit;
    product.point = newPoint || product.point;

    await product.save();
    res.status(200).json({ message: "Product updated", product });
  } catch (error) {
    console.error("Error editing product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🔴 Remove product
export const removeProduct = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.productImage) {
      try {
        const urlParts = product.productImage.split("/");
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = `products/${publicIdWithExt.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (deleteError) {
        console.error("Error deleting image:", deleteError);
      }
    }

    await Product.findByIdAndDelete(productId);
    res.status(200).json({ message: "Product removed successfully" });
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟣 Update product image (Base64)
export const updateProductImage = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { productImage } = req.body;

    if (!productImage) return res.status(400).json({ message: "No image provided" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    try {
      const buffer = Buffer.from(productImage, "base64");
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "products", resource_type: "image" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        Readable.from(buffer).pipe(uploadStream);
      });

      const newImageUrl = result.secure_url;

      // Delete old image if exists
      if (product.productImage) {
        try {
          const urlParts = product.productImage.split("/");
          const publicIdWithExt = urlParts[urlParts.length - 1];
          const publicId = `products/${publicIdWithExt.split(".")[0]}`;
          await cloudinary.uploader.destroy(publicId);
        } catch (deleteError) {
          console.error("Error deleting old image:", deleteError);
        }
      }

      product.productImage = newImageUrl;
      await product.save();

      res.status(200).json({
        success: true,
        message: "Product image updated successfully",
        product,
      });
    } catch (uploadError) {
      console.error("Error uploading image:", uploadError);
      res.status(500).json({ message: "Image upload failed", error: uploadError.message });
    }
  } catch (error) {
    console.error("Error updating product image:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
