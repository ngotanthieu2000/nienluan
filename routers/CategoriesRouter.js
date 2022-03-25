import express from "express";
import { PostModel } from "../models/PostModel.js";
import {CategoriesModel} from "../models/CategoriesModel.js"
const router = express.Router();
router.get('/',async (req,res) =>{
    try {
        const categories = await CategoriesModel.aggregate([
            {
                $lookup:{
                    from:"categories",
                    localField:"_id",
                    foreignField:"parentID",
                    as:"cate_child"
                }
            }
            ,{
                $match:{"parentID":{$eq:null}}
            }
        ])
        res.status(200).json({Categories:categories});
    } catch (error) {
         res.status(500).json({error:error});
    }
});

router.post('/create',async (req,res) =>{
    try {
        const data = req.body;
        const categories = new CategoriesModel(data);
        await categories.save();

        res.status(200).json(categories);
    } catch (error) {
        res.status(500),json({error:error});
    }
});

router.delete('/delete/:id', async (req,res) =>{
    try {
        const deleteCategories = await CategoriesModel.findByIdAndDelete({_id:req.params.id});
        if(deleteCategories){
            await PostModel.updateMany({categories:req.params.id}, {$set:{status:"Hiden"}});
            res.status(200).json({Success:"Categories delete successfuly"});
        }
        else{
            res.status(404 ).json({Error:"Categories not found"});
        }
    } catch (error) {
        res.status(500).json({error});
    }
});

router.get('/statistics/:slug',async (req,res) =>{
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
    // console.log("Time:",time)

    const cateTopView = await CategoriesModel.aggregate([
        {
            $match:{
                parentID:{$ne : null}
            }
        }
        ,{
            $lookup:{
                from:"posts",
                localField:"_id",
                foreignField:"categoriesID",
                as:"post_doc"
            }
        }
        ,{
            $set:{totalView:{$sum:"$post_doc.view"}}
        }
        ,{
            $group:{
                _id:{categoriesID:"$_id", cateName:"$cateName"},
                totalView:{$addToSet:"$totalView"}
            }
        }
        ,{
            $sort:{totalView:-1}
        }
    ])
    if(!cateTopView) return res.status(404).json({Success:false , Message:"Not found"});
    res.status(200).json({Success:true, Message:"That's Oke", cateTopView:cateTopView});
    // res.status(500).json(({Success:false, Message:"Error, please try again", Error:error}));
});

export default router;