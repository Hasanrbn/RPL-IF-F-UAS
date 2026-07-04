/**
 * services/akunService.js
 * Service untuk fitur Kelola Akun User (khusus Owner).
 *
 * Mendukung DFD Level 2 proses 6.0:
 *   6.1 Tambah Akun Baru
 *   6.2 Nonaktifkan Akun
 *   6.3 Ubah Role Akun
 */

const db = require('../config/database');
const bcrypt = require('bcryptjs');

const query = (sql, params = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
    );

const ROLE_VALID = ['owner', 'gudang', 'operasional'];

const getAllUsers = () => {
    const sql = `
        SELECT id, username, nama_lengkap, role, status
        FROM akun_admin
        ORDER BY
            FIELD(role, 'owner', 'gudang', 'operasional'),
            nama_lengkap ASC
    `;
    return query(sql);
};

const tambahAkun = async ({ username, password, nama_lengkap, role }) => {
    const user = String(username || '').trim().toLowerCase();
    const nama = String(nama_lengkap || '').trim();
    const roleBersih = ROLE_VALID.includes(role) ? role : null;

    if (!user || !password || !nama || !roleBersih) {
        throw new Error('Username, password, nama lengkap, dan role wajib diisi dengan benar.');
    }
    if (password.length < 6) {
        throw new Error('Password minimal 6 karakter.');
    }

    const existing = await query('SELECT id FROM akun_admin WHERE username = ? LIMIT 1', [user]);
    if (existing.length) {
        const err = new Error('Username sudah dipakai, pilih username lain.');
        err.code = 'ER_DUP_ENTRY';
        throw err;
    }

    const hash = await bcrypt.hash(password, 10);

    return query(
        `INSERT INTO akun_admin (username, password, nama_lengkap, role, status)
         VALUES (?, ?, ?, ?, 'Aktif')`,
        [user, hash, nama, roleBersih]
    );
};

const ubahStatus = (id, statusBaru) => {
    const status = statusBaru === 'Aktif' ? 'Aktif' : 'Nonaktif';
    return query('UPDATE akun_admin SET status = ? WHERE id = ?', [status, id]);
};

const ubahRole = (id, roleBaru) => {
    if (!ROLE_VALID.includes(roleBaru)) {
        throw new Error('Role tidak valid.');
    }
    return query('UPDATE akun_admin SET role = ? WHERE id = ?', [roleBaru, id]);
};

module.exports = {
    getAllUsers,
    tambahAkun,
    ubahStatus,
    ubahRole,
};
