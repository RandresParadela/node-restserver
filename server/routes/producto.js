const express = require('express');

const Producto = require('../models/producto');

const { verificaToken } = require('../middlewares/autenticacion');
// const { verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

// ====================================
// Mostrar todas las productos
// ====================================

app.get('/producto', (req, res) => {

    // Parametros
    //
    // registro desde el que se envia, o 0 si no se pone
    let desde = req.query.desde || 0;
    // numero de registros que responderá o 5 por defecto
    let limite = req.query.limite || 5;

    Producto.find({ disponible: true })
        .skip(Number(desde))
        .limit(Number(limite))
        .sort('nombre')
        .populate('categoria', 'descripcion') // a partir del id categoria nos saca la descripcion
        .populate('usuario', 'nombre email') // a partir del id usuario nos saca nombre y email
        .exec((err, productos) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            // nos da el total de registros
            // independientemente del desde-hasta
            Producto.count({ disponible: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo
                });

            });

        });

});

// ====================================
// Mostrar producto por ID
// ====================================

app.get('/producto/:id', (req, res) => {

    let id = req.params.id;
    Producto.findById(id)
        .populate('categoria', 'descripcion') // a partir del id categoria nos saca la descripcion
        .populate('usuario', 'nombre email') // a partir del id usuario nos saca nombre y email
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'Producto no existe' }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });

});

// ====================================
// Buscar producto por termino
// ====================================

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

    let termino = req.params.termino;

    // metemos el termino de busqueda en una expresion regular (la i es para que no tenga en cuenta mayusculas)
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre: regex })
        .populate('categoria', 'descripcion') // a partir del id categoria nos saca la descripcion
        .populate('usuario', 'nombre email') // a partir del id usuario nos saca nombre y email
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: { message: 'Producto no existe' }
                });
            }

            res.json({
                ok: true,
                producto: productoDB
            });
        });

});

// ====================================
// Crear Producto
// ====================================

app.post('/producto', verificaToken, function(req, res) {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id // el id viene del token
    });

    producto.save((err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });

    });


});

// ====================================
// Actualizar producto por ID
// ====================================
app.put('/producto/:id', (req, res) => {

    let id = req.params.id;

    let body = req.body;

    // tenemos dos maneras de actualizar
    //
    // esta primera, busca y encuentra directamente con el findByIdAndUpdate. Todos los campos se tienen que reportar
    // por existir campos obligatorios
    // 
    /* let descProducto = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    };

    Producto.findByIdAndUpdate(id, descProducto, { new: true, runValidators: true, context: 'query' }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: { message: ' El producto no existe'}
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });
    }); */

    // segunda. primero busca y luego actualiza.
    // asi aunque el codigo es más largo podemos controlar que campos actualizamos
    // al dejar con su valor original aquellos no enviados, de otra manera los obligatorios darian error.

    Producto.findById(id, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: { message: 'El producto no existe' }
            });
        }

        // ahora actualizamos los campos informados en el body y el resto queda igual
        productoDB.nombre = body.nombre || productoDB.nombre;
        productoDB.precioUni = body.precioUni || productoDB.precioUni;
        productoDB.descripcion = body.descripcion || productoDB.descripcion;
        productoDB.disponible = body.disponible || productoDB.disponible;
        productoDB.categoria = body.categoria || productoDB.categoria;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.json({
                ok: true,
                producto: productoGuardado
            });

        });


    });

});

// ====================================
// Elimina producto por ID (cambiamos disponible a falso)
// ====================================
app.delete('/producto/:id', [verificaToken], function(req, res) {

    let id = req.params.id;

    let cambiaEstado = {
        disponible: false
    };

    Producto.findByIdAndUpdate(id, cambiaEstado, { new: true, runValidators: true, context: 'query' }, (err, productoDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB,
            message: 'Producto borrado (no disponible)'
        });
    });
});


module.exports = app;