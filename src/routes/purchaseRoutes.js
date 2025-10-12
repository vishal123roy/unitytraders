import express from "express";
import { addPurchase, getPurchase, getPurchaseList } from "../controllers/purchaseController.js";

const router = express.Router();

router.get("/getPurchase",getPurchase);
router.post("/addPurchase",addPurchase);
router.get("/getPurchaseList/:id",getPurchaseList)

export default router;



