import {CommentsModel} from '../models/CommentsModel.js';
import { PostModel } from '../models/PostModel.js';
export const createComment =async (req,res)=>{
    try {
        const data = req.body;
        const comment = new CommentsModel({content:req.body.content,authorID:req.user._id,postID:req.body.postID});
        await comment.save();
        res.status(200).json({Success:true,Data:comment});
    } catch (error) {
        res.status(500).json({error:error});
    }
    
}

export const deleteComment = async (req,res)=>{
    try {
        const comment = await CommentsModel.findByIdAndDelete({ _id: req.params.id}).exec();
        if(comment){
            res.status(200).json({Success:"Comment delete successfuly"});
        }
        else{
            res.status(404 ).json({Error:"Comment not found"});
        }
    } catch (error) {
        res.status(500).json({error});
    }
}

export const updateComment = async (req,res)=>{
    try {
        const comment = await CommentsModel.findByIdAndUpdate({ _id: req.params.id},{content:req.body.content}).exec();
        if(comment){
            res.status(200).json({Success:"Comment delete successfuly"});
        }
        else{
            res.status(404 ).json({Error:"Comment not found"});
        }
    } catch (error) {
        res.status(500).json({error});
    }
}