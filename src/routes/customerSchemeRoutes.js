// routes/customerSchemeRoutes.js
import express from "express";
import { getCustomerProgress, redeemSlab } from "../controllers/customerSchemeController.js";

const router = express.Router({ mergeParams: true });

// GET /api/customers/:customerId/progress
router.get("/:customerId/progress", getCustomerProgress);

// POST /api/customers/:customerId/redeem
router.post("/:customerId/redeem", redeemSlab);

// router.get("/topCustomers",getTopCustomers);

export default router;
