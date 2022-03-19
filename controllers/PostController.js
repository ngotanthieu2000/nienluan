import e from "express";
import { PostModel } from "../models/PostModel.js";

export const getPosts = async (req,res) => {
   try {
        const posts = await PostModel.find().sort('-updatedAt');
        res.status(200).json(posts);
   } catch (error) {
       res.status(500).json({error:error});
   }
}

export const createPost = async (req,res) =>{
    try {
        const newPost = req.body;
        const post = new PostModel(newPost);
        await post.save();

        res.status(200).json(post);
    } catch (error) {
       res.status(500).json({error:error});
    }
};
//update post
export const updatePost = async (req,res) =>{
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
};

// delete posy by postID
export const deletePost =async (req,res)=>{
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
    
}
// search post 
export const searchByCategories =async (req,res) =>{
    try {
        const listCate = req.cate;
        console.log('ListCate: ',listCate);
        const posts = await PostModel.find({categoriesID:{$in :listCate}})
        console.log('Post',posts);
        // res.status(200).json(posts);
    } catch (error) {
        res.status(500).json(({Success:false, Message:"Error, please try again", Error:error}));
    }
}

export const searchByTitle = async (req, res) =>{
    const searchStr = req.query.searchStr;
    console.log("Search String:",searchStr);
    if(!searchStr) return getPosts(res,res);

    try {
        const posts = await PostModel.find({title:{$regex:searchStr}});
        console.log(posts);
        if(Object.keys(posts).length === 0 ) return res.status(404).json({Success:false , Message:"Not found"});
        res.status(200).json({Success:true, Message:"That's Oke", Posts:posts});
    } catch (error) {
        res.status(500).json(({Success:false, Message:"Error, please try again", Error:error}));
    }
}

export const searchByAuthor = async (req, res) =>{
    const authorName = req.query.authorName;
    console.log("Search Author Name:",authorName);
    if(!authorName) return getPosts(res,res);

    try {
        const posts = await PostModel.find().populate({
            path:"authorID",
            match:{authorID:{$regex:authorName}},
            select:"fullname -_id"
        }).exec();
        console.log(posts);
        if(Object.keys(posts).length === 0 ) return res.status(404).json({Success:false , Message:"Not found"});
        res.status(200).json({Success:true, Message:"That's Oke", Posts:posts});
    } catch (error) {
        res.status(500).json(({Success:false, Message:"Error, please try again", Error:error}));
    }
}

// statistics

export const getPostLatest = async (req,res) =>{
    const date = new Date();
    var time
    if(req.params.slug==="week"){
        var day = date.getDay();
        var diff = date.getDate() - day + (day == 0 ? -6:1);
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
        const numberPostLatest = await PostModel.find({createdAt:{$gte:time}}).count();
        // console.log(numberPostLatest);
        if(!numberPostLatest) return res.status(404).json({Success:false , Message:"Not found"});
        res.status(200).json({Success:true, Message:"That's Oke", numberPostLatest:numberPostLatest});
    } catch (error) {
        res.status(500).json(({Success:false, Message:"Error, please try again", Error:error}));
    }
}

export const getPostIsTopView = async (req,res) =>{
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
}

export const getPostIsTopLike = async (req,res) =>{
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
}