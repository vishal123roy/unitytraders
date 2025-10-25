// routes/userRoutes.js
import express from "express";
import { 
  loginUser, 
  registerUser, 
  editUser, 
  updateProfileImage 
} from "../controllers/userController.js";

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// User update (excluding profileImage)
router.put("/edit/:id", editUser);

// Profile image upload (no multer middleware)
router.put("/profile-image/:id", updateProfileImage);

export default router;