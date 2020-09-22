// ===========================================
// puerto
// ===========================================

process.env.PORT = process.env.PORT || 3000;

// ===========================================
// Entorno
// ===========================================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ===========================================
// Vencimiento token
// ===========================================
// 60 * 60 * 24 *30

process.env.CADUCIDAD_TOKEN = '48h';

// ===========================================
// SEED autentificacion
// ===========================================

process.env.SEED = process.env.SEED || 'este-es-el-seed-desarrollo';

// ===========================================
// Base de datos
// ===========================================

let urlDB;
if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

// ===========================================
// Google Client ID
// ===========================================

process.env.CLIENT_ID = process.env.CLIENT_ID || '740650940283-vhk8pdkr7pjcepd8jiaj74p682d3ojc6.apps.googleusercontent.com';