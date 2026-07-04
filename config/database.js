/**
 * Konfigurasi koneksi MySQL.
 */

const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_baterai',
});

db.connect((err) => {
    if (err) {
        console.error('Gagal koneksi ke database:', err.message);
        process.exit(1);
    }

    console.log('Koneksi ke database berhasil.');
});

module.exports = db;
