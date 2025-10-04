import express from 'express';
import { addProduct,getProduct,editProduct,removeProduct } from '../controllers/productController.js';

const router = express.Router();

router.get('/getProduct',getProduct);

router.post("/addProduct",addProduct);
router.put("/editProduct:id",editProduct);
router.delete("/removeProduct:id",removeProduct);

export default router;