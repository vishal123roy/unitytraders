import Product from "../models/product.js";

export const getProduct = async (req, res) => {
  try {
    const products = await Product.find();

    if (!products) {
      return res.status(400).json({ message: "products not found" });
    }
    res.status(201).json(products);
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { productName, unit, point } = req.body;

    if (!productName || !unit || !point) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const exisitingProduct = await Product.findOne({ name });

    if (exisitingProduct) {
      return res.status(400).json({ message: "Product already exist" });
    }


    const newProduct = new Product({
      name,
      unit,
      point,
    });

    await newProduct.save();

    res.status(201).json({ success: true, newProduct });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const editProduct = async (req, res) => {
  try {
    const {id:productId} = req.params;
    const { newName, newUnit, newPoint } = req.body;
    const product = await Product.findById({ _id: productId });
    
    if (!product) {
      return res.status(400).json({ message: "product not found" });
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(productId,{
        productName:newName,
        unit:newUnit,
        newPoint:newPoint
    })
    res.status(201).json({message:"Product updated",updatedProduct});

  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

export const removeProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    if(!productId){
        return res.status(400).json({message:"product not found"});
    }
    await Product.findByIdAndDelete({_id:productId})

    res.status(201).json({message:"product removed"})

  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};
