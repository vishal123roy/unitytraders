import express from "express";
import { getCustomers, addCustomer, editCustomer, removeCustomer, upload } from "../controllers/customerController.js";

const router = express.Router();

router.get("/getCustomer", getCustomers);
router.post("/addCustomer", upload.single("profileImage"), addCustomer);
router.put("/editCustomer/:id", upload.single("profileImage"), editCustomer);
router.delete("/removeCustomer/:id", removeCustomer);

export default router;
