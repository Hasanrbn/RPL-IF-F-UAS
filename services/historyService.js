/**
 * services/historyService.js
 * Query riwayat transaksi dari history_log, DIFILTER otomatis sesuai role.
 *
 *   owner       -> semua aktivitas (stok, jual, produksi)
 *   gudang      -> hanya aktivitas stok fisik: Stok Masuk, Stok Dihapus
 *   operasional -> hanya aktivitas penjualan & produksi
 */

const db = require('../config/database');

const query = (sql, params = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
    );

const AKTIVITAS_GUDANG = ['Stok Masuk', 'Stok Dihapus'];
const AKTIVITAS_OPERASIONAL = [
    'Penjualan',
    'Produksi-Keluar',
    'Produksi-Keluar (Rakit)',
    'Produksi-Masuk (Rakit)',
    'Masuk-Produksi',
];

const getHistory = (role) => {
    let filterSql = '';
    let params = [];

    if (role === 'gudang') {
        filterSql = `WHERE h.aktivitas IN (${AKTIVITAS_GUDANG.map(() => '?').join(',')})`;
        params = AKTIVITAS_GUDANG;
    } else if (role === 'operasional') {
        filterSql = `WHERE h.aktivitas IN (${AKTIVITAS_OPERASIONAL.map(() => '?').join(',')})`;
        params = AKTIVITAS_OPERASIONAL;
    }

    const sql = `
        SELECT
            h.*,
            COALESCE(h.nama_barang_saat_itu, s.nama_barang, '[DATA DIHAPUS]') AS nama_barang_tampil,
            DATE_FORMAT(h.waktu_log, '%d %M %Y, %H:%i') AS waktu_format
        FROM history_log h
        LEFT JOIN stok_barang s ON h.barang_id = s.id
        ${filterSql}
        ORDER BY h.waktu_log DESC, h.id DESC
    `;

    return query(sql, params);
};

module.exports = { getHistory };
