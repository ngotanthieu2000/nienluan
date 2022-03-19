import express from "express";
import {getPosts,createPost,updatePost, deletePost,searchByAuthor, 
    searchByCategories, searchByTitle,getPostIsTopView ,getPostLatest ,getPostIsTopLike     
} from '../controllers/PostController.js';
import { getCategoriesByName } from "../controllers/CategoriesController.js";
const router = express.Router();

router.get('/',getPosts); 
router.get('/search/author',searchByAuthor);
router.get('/search/title',searchByTitle);
router.get('/search/categories/:slug',getCategoriesByName,searchByCategories);
router.post('/create',createPost);
router.put('/update',updatePost);
router.delete('/delete/:id',deletePost);

router.get('/statistics/latest/:slug',getPostLatest)

router.get('/statistics/view/:slug',getPostIsTopView)
router.get('/statistics/like/:slug',getPostIsTopLike)


export default router;