'use strict'

const User = require('./user.model');
//Desestructuración
const { validateData, encrypt, checkPassword, deleteSensitiveData } = require('../utils/validate');
const { createToken } = require('../services/jwt');
const e = require('express');       

exports.test = (req, res)=>{
    res.send({message: 'Test function is running', user: req.user});
}

exports.register = async(req, res)=>{
    try{
        let data = req.body;
        data.password = await encrypt(data.password);
        data.role = 'CLIENT';
        let user = new User(data);
        await user.save();
        return res.send({message: 'Account created sucessfully'});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error creating account', error: err.message});
    }
}

exports.login = async(req, res)=>{
    try{
        let data = req.body;
        let credentials = {
            username: data.username,
            password: data.password
        }
        let msg = validateData(credentials);
        if(msg) return res.status(400).send({message: msg})
        let user = await User.findOne({username: data.username});
        if(user && await checkPassword(data.password, user.password)) {
            let token = await createToken(user)
            return res.send({message: 'User logged successfully', token});
        }
        return res.status(404).send({message: 'Invalid credentials'});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error not logged'});
    }
}

exports.save = async(req, res)=>{
    try{
        let data = req.body;
        data.password = await encrypt(data.password);
        let user = new User(data);
        if(data.role.toUpperCase() != 'CLIENT' && data.role.toUpperCase() != 'ADMIN') return res.status(400).send({message: 'CLIENT and ADMIN are the only roles admited'});
        await user.save();
        return res.send({message: 'Account created sucessfully'});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error creating account', error: err.message});
    }
}

exports.update = async(req, res)=>{
    try{
        let userId = req.params.id;
        let data = req.body;
        if(data.password || Object.entries(data).length === 0) return res.status(400).send({message: 'Have submitted some data that cannot be updated'});
        let searchUser = await User.findOne({_id: userId});
        //Validaciones para actualizar segun roles
        if(req.user.role == 'CLIENT' && req.user.sub != searchUser.id)return res.status(400).send({message: 'You can only update your own account'});
        if(req.user.role == 'ADMIN' && searchUser.role == 'ADMIN' && userId != req.user.sub ) return res.status(400).send({message: 'You cannot update other admins account'});
        
        let userUpdated = await User.findOneAndUpdate(
            {_id: userId},
            data,
            {new: true} 
        );
        if(!userUpdated) return res.status(404).send({message: 'User not found and not updated'});
        await deleteSensitiveData(userUpdated)
        return res.send({message: 'User updated', userUpdated})
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error not updated', err: `Username ${err.keyValue.username} is already taken`});
    }
}

exports.updatePassword = async(req, res)=>{
    try{
        let userId = req.params.id;
        let data = req.body;
        data.password = await encrypt(data.password);
        let credentials = {
            password: data.password
        }
        let msg = validateData(credentials);
        if(msg) return res.status(400).send({message: msg})
        let searchUser = await User.findOne({_id: userId});
        //Validaciones para actualizar segun roles
        if(req.user.sub != searchUser.id)return res.status(400).send({message: 'You can only update your own account'});
        
        let userUpdated = await User.findOneAndUpdate(
            {_id: userId},
            data,
            {new: true} 
        );
        if(!userUpdated) return res.status(404).send({message: 'User not found and not updated'});
        await deleteSensitiveData(userUpdated)
        return res.send({message: 'User updated', userUpdated})
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error not updated', err: `Username ${err.keyValue.username} is already taken`});
    }
}

exports.delete = async(req, res)=>{
    try{
        let userId = req.params.id;
        let searchUser = await User.findOne({_id: userId});
        if(req.user.role == 'CLIENT' && req.user.sub != searchUser.id)return res.status(400).send({message: 'You can only delete your own account'});
        if(req.user.role == 'ADMIN' && searchUser.role == 'ADMIN' && userId != req.user.sub ) return res.status(400).send({message: 'You cannot delete other admins account'});
        
        let userDeleted = await User.findOneAndDelete({_id: userId});
        if(!userDeleted) return res.send({message: 'Account not found and not deleted'});
        return res.send({message: `Account deleted sucessfully`});
    }catch(err){
        console.error(err);
        return res.status(500).send({message: 'Error not deleted'});
    }
}