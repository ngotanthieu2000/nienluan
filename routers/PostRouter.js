import express from "express";
import { PostModel } from "../models/PostModel.js";
const router = express.Router();

router.get('/',async (req,res) => {
    try {
         const posts = await PostModel.find().sort('-updatedAt');
         res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({error:error});
    }
}); 

router.get('/categories/:slug', async (req, res)=>{
    const cateName = req.params.slug;
    console.log("Catename:",cateName)
    try {
        const postByCate = await PostModel.aggregate([
            {
                $lookup:{
                    from:"categories",
                    localField:"categoriesID",
                    foreignField:"_id",
                    as:"cate_doc"
                }
            }
            ,{
                $lookup:{
                    from:"categories",
                    localField:"cate_doc.parentID",
                    foreignField:"_id",
                    as:"cate_parent"
                }
            }
            ,{
                $match:{ $or:[
                    {"cate_doc.cateName":{$regex:cateName, $options:"si"}},
                    {"cate_parent.cateName":{$regex:cateName, $options:"si"}}
                ]
            }
            }
            ,{
                $unset:["cate_doc","cate_parent"]
            }
        ])
        if(!postByCate) return res.status(404).json({Success:false , Message:"Not found"});
        res.status(200).json(postByCate);
    } catch (error) {
        res.status(500).json(({Success:false, Message:"Error, please try again", Error:error}));
    }
}); 

router.get('/search/',async (req,res) =>{
    const searchStr = req.query.searchStr;
    // console.log("Search String:",searchStr);
    if(!searchStr) return res.status(404).json({Success:false , Message:"Not found"});
    try {
        const search = await PostModel.aggregate([
            {
                $lookup:{
                    from:"users",
                    localField:"authorID",
                    foreignField:"_id",
                    as:"author_doc"
                }
            },
            {
                $lookup:{
                    from:"categories",
                    localField:"categoriesID",
                    foreignField:"_id",
                    as:"cate_doc"
                }
            },
            {
                $lookup:{
                    from:"categories",
                    localField:"cate_doc.parentID",
                    foreignField:"_id",
                    as:"cate_parent"
                }
            },
            {
                $match:{ $or:[
                        {"author_doc.fullname":{$regex:searchStr, $options:"si"}},
                        {"title":{$regex:searchStr, $options:"si"}},
                        {"cate_doc.cateName":{$regex:searchStr, $options:"si"}},
                        {"cate_parent.cateName":{$regex:searchStr, $options:"si"}}

                    ]
                }
            }
            ,{
                $unset:[ "author_doc","cate_parent"]
            }
            // ,{
            //     $unset:[ "authorID.email", "authorID.password","authorID.phone",
            //             "authorID.avatar","authorID.username","authorID.role",
            //         "authorID.createdAt","authorID.updatedAt","categoriesID.createdAt","categoriesID.updatedAt"]
            // }
        ])
        res.status(200).json(search);
    } catch (error) {
       res.status(500).json({error:error});
    }
});

router.post('/create', async (req,res) =>{
    try {
        const newPost = req.body;
        const post = new PostModel(newPost);
        await post.save();

        res.status(200).json(post);
    } catch (error) {
       res.status(500).json({error:error});
    }
});

router.put('/update',async (req,res) =>{
    try {
        const updatePost = req.body;
        // console.log("Post Update :" ,updatePost);
        const post = await PostModel.findOneAndUpdate({
            _id :updatePost._id},updatePost,{new :true});
        await post.save();

        res.status(200).json(post);
    } catch (error) {
       res.status(500).json({error:error});
    }
});

router.delete('/delete/:id',async (req,res)=>{
    try {
        const deletePost = await PostModel.findByIdAndDelete({ _id: req.params.id}).exec();
        if(deletePost){
            res.status(200).json({Success:"Post delete successfuly"});
        }
        else{
            res.status(404 ).json({Error:"Post not found"});
        }
    } catch (error) {
        res.status(500).json({error});
    }
});

router.get('/statistics/latest/:slug',async (req,res) =>{
    const date = new Date();
    var time
    var numberPostLatest
    if(req.params.slug==="week"){
        var day = date.getDay();
        var diff = date.getDate() - day + (day == 0 ? -6:1);
        time = new Date(date.setDate(diff));
        console.log(time)
        numberPostLatest = await PostModel.aggregate([
            {
                $group:
                  {
                    _id:{$dayOfWeek: "$createdAt"},
                    CountNumber: { 
                        $count :{}
                    }
                  }
            },
            {
                $sort:{
                    "_id":1
                }
            }
        ])
    }
    else if(req.params.slug === "month"){
        time = new Date(date.setDate(1));
        time.setMonth(0);
        console.log(time)
        numberPostLatest = await PostModel.aggregate([
            {
                $group:
                  {
                    _id:{$month: "$createdAt"},
                    CountNumber: { 
                        $count :{}
                    },
                    year:{$first:{$year:"$createdAt"}}

                  }
            }
            ,{
                $sort:{
                    "_id":1
                }
            },
            {
                $match:{
                    "year":{$eq:time.getUTCFullYear()}
                }
            }
        ])
    }
    res.status(200).json (numberPostLatest);
})

router.get('/statistics/view/:slug',async (req,res) =>{
    const date = new Date();
    var time
    if(req.params.slug === "week"){
        var day = date.getDay();
        var  diff = date.getDate() - day + (day == 0 ? -6:1);
        time = new Date(date.setDate(diff));
    }
    else if(req.params.slug === "month"){
        time = new Date(date.setDate(1));
    }
    else{
        time = new Date(date.setDate(1));
        time.setMonth(0);
    }
    try {
        const postTopView = await PostModel.find({createdAt:{$gte:time}}).sort({view:-1}).limit(4);
        console.log(postTopView);
        if(!postTopView) return res.status(404).json({Success:false , Message:"Not found"});
        res.status(200).json({Success:true, Message:"That's Oke", postTopView:postTopView});
    } catch (error) {
        res.status(500).json(({Success:false, Message:"Error, please try again", Error:error}));
    }
})

router.get('/statistics/like/:slug',async (req,res) =>{
    const date = new Date();
    var time
    if(req.params.slug === "week"){
        var day = date.getDay();
        var  diff = date.getDate() - day + (day == 0 ? -6:1);
        time = new Date(date.setDate(diff));
    }
    else if(req.params.slug === "month"){
        time = new Date(date.setDate(1));
    }
    else{
        time = new Date(date.setDate(1));
        time.setMonth(0);
    }
    try {
        const postTopLike = await PostModel.find({createdAt:{$gte:time}}).sort({like:-1}).limit(4);
        // console.log(postTopLike);
        if(!postTopLike) return res.status(404).json({Success:false , Message:"Not found"});
        res.status(200).json({Success:true, Message:"That's Oke", postTopLike:postTopLike});
    } catch (error) {
        res.status(500).json(({Success:false, Message:"Error, please try again", Error:error}));
    }
})


export default router;