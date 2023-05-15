'use strict'

const userController = require('./user.controller');
const express = require('express');
const api = express.Router();
const { isAdmin, ensureAuth } = require('../services/authenticated');

api.get('/', userController.test);
api.post('/register', userController.register);
api.post('/login', userController.login);
api.post('/save', [ensureAuth, isAdmin], userController.save);
api.put('/update/:id', ensureAuth, userController.update);
api.put('/updatePassword/:id', ensureAuth, userController.updatePassword);
api.delete('/delete/:id', ensureAuth, userController.delete);

module.exports = api ;