import express from "express";
import { 
  loginUser, 
  registerUser, 
  editUser, 
  updateProfileImage 
} from "../controllers/userController.js";
import { uploadProfileImage } from '../config/multerConfig.js';


const router = express.Router();


// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// User update (excluding profileImage)
router.put("/edit/:id", editUser);

// Profile image upload
router.put("/profile-image/:id", uploadProfileImage.single("profileImage"), updateProfileImage);

export default router;
