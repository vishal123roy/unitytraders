import express from "express";
import { 
  addProduct, 
  getProduct, 
  editProduct, 
  removeProduct, 
  updateProductImage 
} from "../controllers/productController.js";

const router = express.Router();

router.get("/getProduct", getProduct);
router.post("/addProduct", addProduct); // expects Base64 in JSON
router.put("/editProduct/:id", editProduct);
router.delete("/removeProduct/:id", removeProduct);
router.put("/updateImage/:id", updateProductImage); // expects Base64 in JSON

export default router;
