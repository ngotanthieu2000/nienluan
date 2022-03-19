import express from 'express'
import { createComment ,deleteComment ,updateComment} from '../controllers/CommentsController.js';
import { verify } from '../controllers/AuthController.js';
const router = express.Router();

router.post('/create',verify,createComment);
router.delete('/delete/:id',deleteComment);
router.put('/update/:id',updateComment)

export default router;