'use strict'

const Category = require('./category.model');
const Product = require('../product/product.model');

const { validateData } = require('../utils/validate');
const categoryModel = require('./category.model');

exports.test = (req, res)=>{
    res.send({message: 'Test function is running'});
}

exports.addCategory = async(req, res)=>{
    try{
        let data = req.body;
        if(!data.name){
            data.name = 'DEFAULT';
            data.description = 'Default Category';
        }
        let credentials = {
            name: data.name,
            description: data.description
        }
        let msg = validateData(credentials);
        if(msg) return res.status(400).send({message: msg})
        let newCategory = new Category(data);
        await newCategory.save();
        return res.status(201).send({message: 'Category saved sucessfully'});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error creating category'});
    }
}

exports.getCategories = async(req, res)=>{
    try{
        let categories = await Category.find();
        return res.send({message: 'Category found:', categories});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error getting categories'});
    }
}

exports.getCategory = async(req, res)=>{
    try{
        let categoryId = req.params.id;
        let category = await Category.findOne({_id: categoryId});
        if(!category) return res.status(404).send({message: 'Category not found'});
        return res.send({mesasge: 'Category found:', category});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error getting category'});
    }
}

exports.updateCategory = async(req, res)=>{
    try{
        let categoryId = req.params.id;
        let data = req.body;
        let updatedCategory = await Category.findOneAndUpdate(
            {_id: categoryId},
            data,
            {new: true}
        );
        if(!updatedCategory) return res.send({message: 'Category not found and not updated'});
        return res.send({message: 'Category updated:', updatedCategory});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error updating category'});
    }
}

exports.deleteCategory = async(req, res)=>{
    try{
        let categoryId = req.params.id;
        let categoryDeleted = await Category.findOneAndDelete({_id: categoryId});
        let defaultCategory = await Category.findOne({name: 'DEFAULT'});
        await Product.updateMany(
            {category: categoryId},
            { $set: {category: defaultCategory._id}},
            {new: true}
        );
        if(!categoryDeleted) return res.status(404).send({message: 'Category not found and not deleted'});
        return res.send({message: `Category deleted and products asociated were updated to 'default'`, categoryDeleted});
    }catch(err){
         console.log(err);
        return res.status(500).send({message: 'Error deleting category', err});
    }
}

exports.searchCategoryByName = async(req, res)=>{
    try{
        let data = req.body.name;
        let category = await Category.find({name: {$regex: data}}).exec();
        if(category=='') return res.status(404).send({message: 'Category not found'});
        return res.send({category});
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error searching category', error: err.message});
    }
}