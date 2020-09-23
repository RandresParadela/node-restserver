// const { json } = require('body-parser');
const express = require('express');
const fileUpload = require('express-fileupload');
// const { rest } = require('underscore');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

const app = express();
// default options. todos los archivos que se cargan caen en req.files
// app.use(fileUpload());

app.use(fileUpload({ useTempFiles: true }));

app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    // if (!req.files || Object.keys(req.files).length === 0) {
    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningun archivo'
                }
            });
    }

    // Valida tipos
    let tiposValidos = ['productos', 'usuarios'];


    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos validos son ' + tiposValidos.join(', ')
            }
        });
    }

    //

    let archivo = req.files.archivo; // este archivo se relacionara con una imagen en el body

    let nombreCortado = archivo.name.split('.');
    let extension = nombreCortado[nombreCortado.length - 1];

    // extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones validas son ' + extensionesValidas.join(', ')
            }
        });
    }

    // es una extension valida, continuamos

    // Cambiamos nombre al archivo, le ponemos el id y le añadimos los milisegundos para no sobreescribir
    // nada y prevenir problemas con el cache.

    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

    archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (err) => {
        if (err)
            return res.status(500)
                .json({
                    ok: false,
                    err
                });

        // Aqui ya tenemos la imagen cargada

        // res.json({
        //     ok: true,
        //     message: 'Imagen subida correctamente'
        // });

        if (tipo === 'usuarios') {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }


    });
});


function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {

        if (err) {
            // borrarmos la imagen en caso de error para que no se quede colgada
            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            // borrarmos la imagen en caso de error para que no se quede colgada
            borraArchivo(nombreArchivo, 'usuarios');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El usuario no existe'
                }
            });
        }

        // Borramos posible imagen existente anterior
        borraArchivo(usuarioDB.img, 'usuarios');


        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        });

    });

}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoDB) => {

        if (err) {
            // borrarmos la imagen en caso de error para que no se quede colgada
            borraArchivo(nombreArchivo, 'productos');

            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            // borrarmos la imagen en caso de error para que no se quede colgada
            borraArchivo(nombreArchivo, 'productos');

            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El Producto no existe'
                }
            });
        }

        // Borramos posible imagen existente anterior
        borraArchivo(productoDB.img, 'productos');


        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoGuardado,
                img: nombreArchivo
            })
        });

    });


}

function borraArchivo(nombreImagen, tipo) {
    // evaluamos si existe la ruta y la borra si existe
    let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreImagen}`);
    // si existe lo borramos con el unlink
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }

}

module.exports = app;