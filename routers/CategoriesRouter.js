import express from "express";
import { createCategories, deleteCategories, getCategoriesByName,getCateIsTopView } from "../controllers/CategoriesController.js";

const router = express.Router();
router.get('/',getCategoriesByName);
router.post('/create',createCategories);
router.delete('/delete/:id', deleteCategories);

router.get('/statistics/:slug',getCateIsTopView);
export default router;