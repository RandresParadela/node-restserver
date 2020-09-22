const express = require('express');

//encriptacion password hash de una sola via
const bcrypt = require('bcrypt');

// underscore. usado para seleccionar campos en el PUT
const _ = require('underscore');

const Usuario = require('../models/usuario');

const { verificaToken } = require('../middlewares/autenticacion');
const { verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();



// Get recupera usuarios
app.get('/usuario', verificaToken, (req, res) => {

    // Parametros
    //
    // registro desde el que se envia, o 0 si no se pone
    let desde = req.query.desde || 0;
    // numero de registros que responderá o 5 por defecto
    let limite = req.query.limite || 5;

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(Number(desde))
        .limit(Number(limite))
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            // nos da el total de registros
            // independientemente del desde-hasta
            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });

            });

        });

});


//

app.post('/usuario', [verificaToken, verificaAdmin_Role], function(req, res) {
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        // quitamos password de la respuesta para no devolverla
        // usuarioDB.password = null;   --> asi la dejamos aunque devuelta a nulo, pero se  veria el campo

        res.json({
            ok: true,
            usuario: usuarioDB
        });

    });


});


// Actualizacion Usuario
app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;

    // así se actualizarian todos los campos, pero no queremos eso.
    // let body = req.body;

    // usamos pick de underscore para decirle que campos se pueden actualizar
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

// Borrado fisico del registro de usuario

/*
app.delete('/usuario/:id', function(req, res) {
    let id = req.params.id;

    Usuario.findByIdAndDelete(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        // Si no existe el usuario, error
        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            });

        }

        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });

});
*/

// Borrado. Marca usuario con estado = false
app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;

    let cambiaEstado = {
        estado: false
    };

    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

module.exports = app;