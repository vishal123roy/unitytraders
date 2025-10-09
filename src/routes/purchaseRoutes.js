import express from "express";
import { addPurchase, getPurchase } from "../controllers/purchaseController";

const router = express.Router();

router.get("/getPurchase",getPurchase);
router.post("/addPurchase",addPurchase);

export default router;



