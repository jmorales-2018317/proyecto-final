'use strict'

const express = require('express');
const api = express.Router();
const productController = require('./product.controller');
const { ensureAuth, isAdmin } = require('../services/authenticated');

api.get('/', productController.test);
api.post('/add', [ensureAuth, isAdmin], productController.addProduct);
api.get('/get', ensureAuth, productController.getProducts);
api.get('/get/:id', ensureAuth, productController.getProduct);
api.put('/update/:id', [ensureAuth, isAdmin], productController.updateProduct);
api.delete('/delete/:id', [ensureAuth, isAdmin], productController.deleteProduct);
api.post('/searchByName', ensureAuth, productController.searchProductByName);
api.post('/searchByCategory', ensureAuth, productController.searchProductByCategory);

module.exports = api;