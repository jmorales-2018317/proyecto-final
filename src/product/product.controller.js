'use strict'

const Product = require('./product.model');
const Category = require('../category/category.model');

const { validateData } = require('../utils/validate');

exports.test = (req, res)=>{
    res.send({message: 'Test function is running'});
}

exports.addProduct = async(req, res)=>{
    try{
        let data = req.body;
        let credentials = {
            name: data.name,
            description: data.description,
            brand: data.brand,
            price: data.price,
            stock: data.stock,
            category: data.category
        };
        let msg = validateData(credentials);
        if(msg) return res.status(400).send({message: msg});
        let alreadyCategory = await Category.findOne({_id: data.category});
        console.log(alreadyCategory)
        if(!alreadyCategory) return res.status(400).send({message: 'Category not found'});
        let newProduct = new Product(data);
        await newProduct.save();
        return res.status(201).send({message: 'Product saved sucessfully'});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error not updated', err: `Product ${err.keyValue.name} is already taken`});
    }
}

exports.getProducts = async(req, res)=>{
    try{
        let products = await Product.find().populate('category').lean();
        return res.send({message: 'Products found:', products})
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error getting products'});
    }
}

exports.getProduct = async(req, res)=>{
    try{
        let productId = req.params.id;
        let product = await Product.findOne({_id: productId}).populate('category').lean();
        if(!product) return res.status(404).send({message: 'Product not found'});
        return res.send({mesasge: 'Product found:', product});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error getting product'});
    }
}

exports.updateProduct = async(req, res)=>{
    try{
        let productId = req.params.id;
        let data = req.body;
        let existCategory = await Category.findOne({_id: data.category});
        if(!existCategory && existCategory == null) return res.status(404).send({message: 'Category not found'});
        let updatedProduct = await Product.findOneAndUpdate(
            {_id: productId},
            data,
            {new: true}
        ).populate('category').lean();
        if(!updatedProduct) return res.send({message: 'Product not found and not updated'});
        return res.send({message: 'Product updated:', updatedProduct});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error updating product'});
    }
}

exports.deleteProduct = async(req, res)=>{
    try{
        let productId = req.params.id;
        let productDeleted = await Product.findOneAndDelete({_id: productId}).populate('category').lean();
        if(!productDeleted) return res.status(404).send({message: 'Product not found and not deleted'});
        return res.send({message: 'Product deleted succesfully', productDeleted})
    }catch(err){
         console.log(err);
        return res.status(500).send({message: 'Error deleting Product'});
    }
}

exports.searchProductByName = async(req, res)=>{
    try{
        let data = req.body.name;
        let product = await Product.find({name: {$regex: data}}).exec();
        console.log(data)
        if(data == '' || data == null || product=='') return res.status(404).send({message: 'Product not found'});
        return res.send({product});
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error searching product', error: err.message});
    }
}

exports.searchProductByCategory = async(req, res)=>{
    try{
        let data = req.body.category;
        let category = await Product.find( {category: data});
        if(data.category == '' || category=='') return res.status(404).send({message: 'Products not found'});
        return res.status(404).send({message: 'Matches Found', category});
    }catch(err){
        console.log(err);
        return res.status(500).send({message: 'Error searching category', error: err.message});
    }
}