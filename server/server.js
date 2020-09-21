const express = require('express');
const mongoose = require('mongoose');

const path = require('path');

const bodyParser = require('body-parser');

// Configuracion global
require('./config/config');


const app = express();


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// habilitar carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));



// // importamos y usamos rutas de usuario
// app.use(require('./routes/usuario'));


// importamos y usamos rutas

app.use(require('./routes/index'));



// Conexion a MongoDB
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true },
    (err) => {
        if (err) throw err;

        console.log('Base de datos Online');

    });

app.listen(process.env.PORT, () => console.log('Escuchando puerto ', process.env.PORT));