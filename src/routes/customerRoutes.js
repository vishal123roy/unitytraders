import express from "express";
import {
  getCustomers,
  addCustomer,
  editCustomerDetails,
  updateUserProfileImage,
  removeCustomer,
  getCustomerById
} from "../controllers/customerController.js";
import { uploadProfileImage } from '../config/multerConfig.js';


const router = express.Router();

router.get("/get", getCustomers);
router.get("/get/:userId", getCustomerById);
router.post("/add", addCustomer);
router.put("/edit/:userId", editCustomerDetails);
router.put("/update-image/:userId", uploadProfileImage.single("profileImage"), updateUserProfileImage);
router.delete("/remove/:userId", removeCustomer);

export default router;
