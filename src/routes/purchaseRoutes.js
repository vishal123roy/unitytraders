// routes/purchaseRoutes.js
import express from "express";
import { addPurchase, getPurchase, getPurchaseList } from "../controllers/purchaseController.js";

const router = express.Router();

router.post("/", addPurchase);
router.get("/", getPurchase);
router.get("/:id/products", getPurchaseList);

export default router;
