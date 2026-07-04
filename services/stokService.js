/**
 * Service untuk stok gudang dan master barang.
 */

const db = require('../config/database');

const query = (sql, params = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
    );

const toNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
};

const getDashboardData = async () => {
    const sqlMaster = `
        SELECT MIN(id) AS id, nama_barang, kode_sku
        FROM master_barang
        GROUP BY nama_barang, kode_sku
        ORDER BY nama_barang ASC
    `;

    const sqlStok = `
        SELECT
            s.*,
            DATE_FORMAT(s.waktu_input, '%M %Y') AS bulan_tahun
        FROM stok_barang s
        ORDER BY s.waktu_input DESC, s.id DESC
    `;

    const sqlSummary = `
        SELECT
            COALESCE(SUM(stok * (modal / NULLIF(stok_awal, 0))), 0) AS total_aset,
            COALESCE(SUM(jumlah_terjual * (harga_jual - (modal / NULLIF(stok_awal, 0)))), 0) AS profit_nyata,
            COALESCE(SUM(stok), 0) AS total_stok,
            COALESCE(SUM(jumlah_terjual), 0) AS total_terjual
        FROM stok_barang
    `;

    const sqlTopSelling = `
        SELECT nama_barang, SUM(jumlah_terjual) AS total_laku
        FROM stok_barang
        GROUP BY nama_barang
        HAVING total_laku > 0
        ORDER BY total_laku DESC
        LIMIT 5
    `;

    const [master, stok, summary, topSelling] = await Promise.all([
        query(sqlMaster),
        query(sqlStok),
        query(sqlSummary),
        query(sqlTopSelling),
    ]);

    const dataPerBulan = {};
    stok.forEach((item) => {
        const bulan = item.bulan_tahun || 'Tanpa Periode';
        if (!dataPerBulan[bulan]) dataPerBulan[bulan] = [];
        dataPerBulan[bulan].push(item);
    });

    return {
        data_master: master,
        data_per_bulan: dataPerBulan,
        summary: summary[0] || {},
        top_selling: topSelling,
    };
};

const tambahMaster = async (nama_barang, kode_sku) => {
    const nama = String(nama_barang || '').trim();
    const sku = String(kode_sku || '').trim().toUpperCase();

    if (!nama || !sku) {
        return Promise.reject(new Error('Nama barang dan SKU wajib diisi.'));
    }

    const existing = await query(
        'SELECT id FROM master_barang WHERE LOWER(nama_barang) = LOWER(?) OR kode_sku = ? LIMIT 1',
        [nama, sku]
    );

    if (existing.length) {
        const err = new Error('Nama barang atau SKU sudah terdaftar.');
        err.code = 'ER_DUP_ENTRY';
        throw err;
    }

    return query('INSERT INTO master_barang (nama_barang, kode_sku) VALUES (?, ?)', [nama, sku]);
};

const getAdminUsername = (admin) => admin?.username || null;

const simpanStok = async ({ nama_barang, kode_sku, kondisi, stok, harga_jual, modal }, admin) => {
    const nama = String(nama_barang || '').trim();
    const sku = String(kode_sku || '').trim().toUpperCase();
    const qty = toNumber(stok);
    const harga = toNumber(harga_jual);
    const modalTotal = toNumber(modal);
    const kondisiBarang = kondisi === 'RUSAK' ? 'RUSAK' : 'BAGUS';

    if (!nama || !sku) throw new Error('Nama barang dan SKU wajib dipilih.');
    if (qty < 0 || harga < 0 || modalTotal < 0) throw new Error('Angka stok, modal, dan harga jual tidak boleh negatif.');

    const result = await query(`
        INSERT INTO stok_barang
            (nama_barang, kode_sku, kondisi, stok_awal, stok, harga_jual, modal)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [nama, sku, kondisiBarang, qty, qty, harga, modalTotal]);

    await query(`
        INSERT INTO history_log
            (barang_id, nama_barang_saat_itu, aktivitas, jumlah_perubahan, penanggung_jawab, harga_satuan_log)
        VALUES (?, ?, 'Stok Masuk', ?, ?, ?)
    `, [result.insertId, nama, qty, getAdminUsername(admin), harga]);

    return result;
};

const hapusStok = async (id, admin) => {
    const rows = await query('SELECT nama_barang, stok, harga_jual FROM stok_barang WHERE id = ?', [id]);

    if (rows.length) {
        await query(`
            INSERT INTO history_log
                (barang_id, nama_barang_saat_itu, aktivitas, jumlah_perubahan, penanggung_jawab, harga_satuan_log)
            VALUES (?, ?, 'Stok Dihapus', ?, ?, ?)
        `, [id, rows[0].nama_barang, -Math.abs(toNumber(rows[0].stok)), getAdminUsername(admin), rows[0].harga_jual || 0]);
    }

    return query('DELETE FROM stok_barang WHERE id = ?', [id]);
};

const hapusBarangMaster = (id) =>
    query('DELETE FROM master_barang WHERE id = ?', [id]);

module.exports = {
    getDashboardData,
    tambahMaster,
    simpanStok,
    hapusStok,
    hapusBarangMaster,
};
