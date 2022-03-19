import e from "express";
import {CategoriesModel} from "../models/CategoriesModel.js";
import { PostModel } from "../models/PostModel.js";
export const createCategories = async (req,res) =>{
    try {
        const data = req.body;
        const categories = new CategoriesModel(data);
        await categories.save();

        res.status(200).json(categories);
    } catch (error) {
        res.status(500),json({error:error});
    }
}

export const getCategories = async (req,res) =>{
    try {
  
        const categories = await CategoriesModel.find({parentID:null});
        if(categories){
            for(let i=0;i<categories.length;i++)
            {
                const cate = await CategoriesModel.find({parentID:categories[i]._id});
                Object.defineProperty(categories[i],"child",{value: cate, writable:true, enumerable:true, configurable:true});
                console.log(`Categories Child ${i}:${categories[i].child}`);
            }
            console.log(`Categories:${categories}`);

            res.status(200).json({Categories:categories});
        }
        else{
            res.status(404).json({error:"Not found categories!"});
        }
    } catch (error) {
         res.status(500).json({error:error});
    }
}

export const deleteCategories = async (req,res) =>{
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
}

export const getCategoriesByName = async (req,res,next) =>{
    try {
        const listCate = []
        // console.log("Name:",req.params.slug)
        const categories = await CategoriesModel.find({cateName: {$regex: new RegExp(req.params.slug,"i")}});
        // console.log("categories:",categories)
          if(!categories)  res.status(404).json({error:"Not found categories!"});
        //   console.log("Parent",categories[0].parentID)
          if(categories[0].parentID===null) {
              var categoriesChill = await CategoriesModel.find({parentID:categories[0]._id});
              categoriesChill.forEach(element =>{
              })
            //   console.log("Categoris Chill :",categoriesChill);
          }
          else{
            //   console.log("Categoris Chill :",categories);
            listCate.push(categories[0]._id)
          }
          req.cate = listCate;
          next()
    } catch (error) {
         res.status(500).json({error:error});
    }
}

export const getCateIsTopView = async (req,res) =>{
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
        // const postTopView = await PostModel.find({createdAt:{$gte:time}},{$group:{categories:categoriesID}}).sort({view:-1}).limit(4);
        const cateTopView = await await PostModel.aggregate([
            {
                $match:{
                    createdAt:{$gte:time}
                }
            },
            {
                $limit:5
            },
            {
                $sort:{view:-1}
            },
            {
              $group: {
                _id: "$categoriesID"
              },
            },
            {
              $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "cate_doc",
              },
            },
            {
              $project: {
                cateName: "$cate_doc.cateName",
              },
            },
          ]);
        if(!cateTopView) return res.status(404).json({Success:false , Message:"Not found"});
        res.status(200).json({Success:true, Message:"That's Oke", cateTopView:cateTopView});
    } catch (error) {
        res.status(500).json(({Success:false, Message:"Error, please try again", Error:error}));
    }
}