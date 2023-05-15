'use strict'

const express = require('express');
const api = express.Router();
const categoryController = require('./category.controller');
const { ensureAuth, isAdmin } = require('../services/authenticated');

api.get('/', categoryController.test);
api.post('/add', [ensureAuth, isAdmin], categoryController.addCategory);
api.get('/get', ensureAuth, categoryController.getCategories);
api.get('/get/:id', ensureAuth, categoryController.getCategory);
api.put('/update/:id', [ensureAuth, isAdmin], categoryController.updateCategory);
api.delete('/delete/:id', [ensureAuth, isAdmin], categoryController.deleteCategory);
api.post('/search', ensureAuth, categoryController.searchCategoryByName);

module.exports = api;