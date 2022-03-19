import express from "express";
import {getUsers,updateUser,demo} from '../controllers/UserController.js';
// import { authLogin, authLogout, authRegister, token, validToken } from "../controllers/AuthController.js";
import { login, logout, register, refresh, verify } from "../controllers/AuthController.js";
const router = express.Router();

// router.get('/',verify,getUsers); 
router.get('/',getUsers); 
router.post('/register',register);
router.post('/login',login);
router.delete('/logout',verify,logout);
router.use('/token',refresh);
router.put('/update',verify,updateUser);

router.get("/getPostsFollowCate", demo);
export default router;