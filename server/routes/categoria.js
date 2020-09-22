const express = require('express');

const Categoria = require('../models/categoria');

const { verificaToken } = require('../middlewares/autenticacion');
const { verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

// ====================================
// Mostrar todas las categorias
// ====================================

app.get('/categoria', (req, res) => {

    // Parametros
    //
    // registro desde el que se envia, o 0 si no se pone
    let desde = req.query.desde || 0;
    // numero de registros que responderá o 5 por defecto
    let limite = req.query.limite || 5;

    Categoria.find({})
        .skip(Number(desde))
        .limit(Number(limite))
        .sort('descripcion')
        .populate('usuario', 'nombre email') // a partir del id usuario nos saca el resto de campos
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            // nos da el total de registros
            // independientemente del desde-hasta
            Categoria.count((err, conteo) => {
                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });

            });

        });

});

// ====================================
// Mostrar categoria por ID
// ====================================

app.get('/categoria/:id', (req, res) => {

    let id = req.params.id;
    Categoria.findById({ id }, (err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

// ====================================
// Crear Categoria
// ====================================

app.post('/categoria', verificaToken, function(req, res) {
    let body = req.body;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id // el id viene del token
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });


});

// ====================================
// Actualizar categoria por ID
// ====================================
app.put('/categoria/:id', (req, res) => {

    let id = req.params.id;

    let body = req.body;

    let descCategoria = {
        descripcion: body.descripcion
    };

    console.log(id, descCategoria);

    Categoria.findByIdAndUpdate(id, descCategoria, { new: true, runValidators: true, context: 'query' }, (err, categoriaDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });

});

// ====================================
// Actualizar categoria por ID
// ====================================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], function(req, res) {

    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        // Si no existe la categoria, error
        if (!categoriaBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no Existe'
                }
            });

        }

        res.json({
            ok: true,
            message: 'Categoria borrada'
                // categoria: CategoriaBorrado
        });
    });
});


module.exports = app;