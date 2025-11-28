// routes/purchaseRoutes.js
import express from "express";
import { addPurchase, getPurchase, getPurchaseList,removePurchase } from "../controllers/purchaseController.js";

const router = express.Router();

router.post("/addPurchase", addPurchase);
router.get("/getPurchase/:id", getPurchase);
router.get("/purchaselist/:id", getPurchaseList);
router.delete("/deletePurchase/:id",removePurchase);

export default router;
