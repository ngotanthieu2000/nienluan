import express from 'express';
import { verify } from '../controllers/AuthController.js';
import { createRole, getsRole, updateRole } from '../controllers/RoleController.js';

const router = express.Router();
router.get('/',getsRole);
router.post('/create',createRole);
router.put('/update',verify,updateRole)
export default router;