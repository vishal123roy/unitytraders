// routes/purchaseRoutes.js
import express from "express";
import { addPurchase, getPurchase, getPurchaseList } from "../controllers/purchaseController.js";

const router = express.Router();

router.post("/", addPurchase);
router.get("/", getPurchase);
router.get("/purchaselist/:id", getPurchaseList);

export default router;
