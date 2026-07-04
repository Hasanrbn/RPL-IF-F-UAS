/**
 * services/authService.js
 */
const db = require('../config/database');
const bcrypt = require('bcryptjs'); // Pastikan package ini yang terpasang

const login = (username, password) => {
    return new Promise((resolve, reject) => {
        // 1. Ambil data admin berdasarkan username
        const sql = "SELECT * FROM akun_admin WHERE username = ?";
        
        db.query(sql, [username], async (err, results) => {
            if (err) return reject(err);

            // Jika username tidak ditemukan di database
            if (results.length === 0) {
                console.log("-> Debug Service: Username tidak ditemukan di DB.");
                return resolve(null);
            }

            const admin = results[0];

            // 2. Cek status keaktifan (WAJIB 'Aktif' dengan 'A' Kapital sesuai phpMyAdmin)
            if (admin.status !== 'Aktif') {
                console.log("-> Debug Service: Akun ditemukan tetapi status tidak 'Aktif'.");
                return resolve(null);
            }

            try {
                // 3. Komparasi password mentah 'gudang123' dengan hash dari database
                const passwordCocok = await bcrypt.compare(password, admin.password);
                
                if (passwordCocok) {
                    // Jika cocok, pisahkan password dan kembalikan data admin
                    const { password, ...dataAdmin } = admin;
                    return resolve(dataAdmin);
                } else {
                    console.log("-> Debug Service: Password tidak cocok dengan hash Bcrypt.");
                    return resolve(null);
                }
            } catch (error) {
                console.error("-> Debug Service Error Bcrypt:", error);
                return reject(error);
            }
        });
    });
};

module.exports = { login };