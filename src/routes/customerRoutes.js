// routes/customerRoutes.js
import express from "express";
import multer from "multer";
import {
  getCustomers,
  addCustomer,
  editCustomerDetails,
  updateUserProfileImage,
  removeCustomer,
  getCustomerById
} from "../controllers/customerController.js";

const router = express.Router();

// Configure multer for memory storage (stores file in buffer)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.get("/get", getCustomers);
router.get("/get/:userId", getCustomerById);

// Add multer middleware to routes that need to handle file uploads
router.post("/add", upload.single("profileImage"), addCustomer);
router.put("/edit/:userId", editCustomerDetails);
router.put("/update-image/:userId", upload.single("profileImage"), updateUserProfileImage);
router.delete("/remove/:userId", removeCustomer);

export default router;