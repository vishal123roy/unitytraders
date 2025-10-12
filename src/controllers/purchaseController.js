import Customer from "../models/customer.js";
import Purchase from "../models/purchase.js";

export const getPurchase = async (req,res) => {
    try {
        const purchaselist = await Purchase.find();
        if(!purchaselist){
            return res.status(400).json({message:"puchaselist not found"});
        }

        res.status(200).json(purchaselist);

    } catch (error) {
        res.status(500).json({message:"server error"})
    }
}

export const addPurchase = async (req,res) => {
    try {
        const {customerId,products,total} = req.body;

        if(!customerId || !products || !total){
            return res.status(400).json({message:"all field are required"});
        }

        const newPurchase = new Purchase({
            customer:customerId,
            date:Date.now(),
            productList:products,
            totalPoints:total
        })
        
        await newPurchase.save();

        res.status(201).json(newPurchase)

    } catch (error) {
        res.status(500).json({message:"server error"});
    }
}

export const getPurchaseList = async (req,res) => {
    try {
        const {id:purchaseId} = req.params;

        const purchaseList = await Purchase.findById(purchaseId).populate('productList.product');

        if(!purchaseList){
            return res.status(400).json({message:"purchaselist not found"});
        }

        const {productList} = purchaseList;

        res.status(200).json(productList);

    } catch (error) {
        res.status(500).json({message:"server error"})
    }
}