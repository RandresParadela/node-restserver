const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');

// Configuracion global
require('./config/config');


const app = express();


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// importamos y usamos rutas de usuario
app.use(require('./routes/usuario'));

// Conexion a MongoDB
mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true },
    (err) => {
        if (err) throw err;

        console.log('Base de datos Online');

    });

app.listen(process.env.PORT, () => console.log('Escuchando puerto ', process.env.PORT));