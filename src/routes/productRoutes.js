// routes/productRoutes.js
import express from 'express';
import { 
  addProduct, 
  getProduct, 
  editProduct, 
  removeProduct, 
  updateProductImage 
} from '../controllers/productController.js';

import { uploadProductImage } from '../config/multerConfig.js';

const router = express.Router();

router.get('/getProduct', getProduct);
router.post('/addProduct', uploadProductImage.single('productImage'), addProduct);
router.put('/editProduct/:id', editProduct);
router.delete('/removeProduct/:id', removeProduct);

// ✅ New route for updating product image separately
router.put('/updateImage/:id', uploadProductImage.single('productImage'), updateProductImage);

export default router;
