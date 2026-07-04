/**
 * Service untuk proses penjualan barang.
 */

const db = require('../config/database');

const query = (sql, params = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
    );

const jualBarang = async (id, jumlahJual, admin) => {
    const rows = await query('SELECT nama_barang, harga_jual FROM stok_barang WHERE id = ?', [id]);
    if (!rows.length) return false;

    const { nama_barang, harga_jual } = rows[0];

    const update = await query(`
        UPDATE stok_barang
        SET stok = stok - ?, jumlah_terjual = jumlah_terjual + ?
        WHERE id = ? AND stok >= ?
    `, [jumlahJual, jumlahJual, id, jumlahJual]);

    if (update.affectedRows === 0) return false;

    await query(`
        INSERT INTO history_log
            (barang_id, nama_barang_saat_itu, aktivitas, jumlah_perubahan, penanggung_jawab, harga_satuan_log)
        VALUES (?, ?, 'Penjualan', ?, ?, ?)
    `, [id, nama_barang, -jumlahJual, admin?.username || null, harga_jual]);

    return true;
};

module.exports = { jualBarang };
