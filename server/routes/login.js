const express = require('express');

//encriptacion password hash de una sola via
const bcrypt = require('bcrypt');

//token
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const app = express();


app.post('/login', (req, res) => {

    let body = req.body;


    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // chequeamos si existe email y devolvemos error
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }

            });
        }

        // chequeamos contraseña y devolvermos error

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }

            });
        }

        // sacamos token
        let token = jwt.sign({
            usuario: usuarioDB // payload
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); // espira en 30 dias

        // Si estamos aqui es que todo esta correcto y devolvemos usuario
        res.json({
            ok: true,
            usuario: usuarioDB,
            token // no hace falta poner token: token
        })

    });


});



module.exports = app;