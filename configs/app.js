'use strict'

const express = require('express');
//Logs de las solicitudes que reciba el servidor
const morgan = require('morgan');
//Seguridad básica al servidor
const helmet = require('helmet');
//Aceptación de solicitudes desde otro origen o desde la misma máquina
const cors = require('cors');
//Instancia de express
const app = express();
const port = process.env.PORT || 3200;
const userRoutes = require('../src/user/user.routes');
const productRoutes = require('../src/product/product.routes');
const categoryRoutes = require('../src/category/category.routes');

//CONFIGURAR EL SERVIDOR HTTP DE EXPRESS
app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

//Rutas de cada colección
app.use('/user', userRoutes);
app.use('/product', productRoutes);
app.use('/category', categoryRoutes);

//FUNCIÓN PARA LEVANTAR EL SERVIDOR
exports.initServer = ()=>{
    app.listen(port);
    console.log(`Server http running in port ${port}`);
}