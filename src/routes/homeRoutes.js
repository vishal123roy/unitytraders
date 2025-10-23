import express from "express";
import { getMonthlyTop, getUser, getSchemes, getAnnualTop } from "../controllers/homeController.js";

const router = express.Router();

router.get("/user/:id",getUser);
router.get("/schemes",getSchemes);
router.get("/monthlyScore",getMonthlyTop);
router.get("/annualScore",getAnnualTop);

export default router;