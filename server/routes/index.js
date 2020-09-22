const express = require('express');

const app = express();

// importamos y usamos rutas de usuario
app.use(require('./usuario'));

// importamos y usamos rutas de categoria
app.use(require('./categoria'));

// importamos y usamos rutas de producto
app.use(require('./producto'));

// importamos y usamos rutas de login
app.use(require('./login'));


module.exports = app;