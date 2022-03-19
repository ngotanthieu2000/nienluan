import postRouter from './PostRouter.js';
import userRouter from './UserRouter.js';
import roleRouter from './RoleRouter.js';
import categoriesRouter from './CategoriesRouter.js';
import commentRouter from'./CommentRouter.js';

export default function route(app) {
    app.use('/post',postRouter);
    app.use('/user',userRouter);
    app.use('/role',roleRouter);
    app.use('/categories',categoriesRouter);
    app.use('/comment',commentRouter);
}