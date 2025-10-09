import Customer from "../models/customer";
import Purchase from "../models/purchase";

export const getPurchase = async (req,res) => {
    try {
        const purchaselist = await Purchase.find();
        if(!purchaselist){
            return res.status(400).json({message:"puchaselist not found"});
        }

        res.status(201).json(purchaselist);

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

    } catch (error) {
        res.status(500).json({message:"server error"});
    }
}

export const getPurchaseList = async (req,res) => {
    try {
        const {PurchaseId} = req.body;

        const purchaseList = await Purchase.findById({_id:PurchaseId});

        if(!purchaseList){
            return res.status(400).json({message:"purchaselist not found"});
        }

        const {productList} = purchaseList;
        
        const list = productList.map((item)=>{
            return item.findById().populate();
        })

        res.status(200).json(list)

    } catch (error) {
        res.status(500).json({message:"server error"})
    }
}