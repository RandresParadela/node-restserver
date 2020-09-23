const jwt = require('jsonwebtoken');

// ===================================
// funcion para verificacion del token
// ===================================
//

let verificaToken = (req, res, next) => {
    let token = req.get('token'); // recogemos el id token del header

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }

        // en decoded estaria el payload
        req.usuario = decoded.usuario;

        // al hacer next seguiria la peticion del Get para devolver el valor especificado en el
        next();

    });


};

// ===================================
// Verifica admin role
// ===================================
//

let verificaAdmin_Role = (req, res, next) => {
    let usuario = req.usuario;

    // Chequeamos si tiene el rol de ADMIN
    if (usuario.role === 'ADMIN_ROLE') {

        // al hacer next seguiria la peticion del Get para devolver el valor especificado en el
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario debe ser Administrador'
            }
        });
    }

};

// ===================================
// Verifica token en imagen
// ===================================
//

let verificaTokenImg = (req, res, next) => {
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no valido'
                }
            });
        }

        // en decoded estaria el payload
        req.usuario = decoded.usuario;

        // al hacer next seguiria la peticion del Get para devolver el valor especificado en el
        next();

    });

}


module.exports = {
    verificaToken,
    verificaAdmin_Role,
    verificaTokenImg
};