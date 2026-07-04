/**
 * Service untuk modul produksi internal.
 */

const db = require('../config/database');

const query = (sql, params = []) =>
    new Promise((resolve, reject) =>
        db.query(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)))
    );

const beginTransaction = () =>
    new Promise((resolve, reject) => db.beginTransaction((err) => (err ? reject(err) : resolve())));

const commit = () =>
    new Promise((resolve, reject) => db.commit((err) => (err ? reject(err) : resolve())));

const rollback = () =>
    new Promise((resolve) => db.rollback(() => resolve()));

const toArray = (value) => {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null || value === '') return [];
    return [value];
};

const toNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
};

const getProduksiData = async () => {
    const sqlHistory = `
        SELECT
            *,
            DATE_FORMAT(waktu_ambil, '%d %M %Y, %H:%i') AS waktu_format
        FROM produksi_detail
        ORDER BY id DESC
    `;

    const sqlBarang = `
        SELECT id, nama_barang, kode_sku, stok, stok_awal, modal, harga_jual
        FROM stok_barang
        WHERE stok > 0
        ORDER BY nama_barang ASC
    `;

    const [history, barang] = await Promise.all([
        query(sqlHistory),
        query(sqlBarang),
    ]);

    return { data_produksi: history, daftar_barang: barang };
};

const ambilBarang = async ({ barang_id, jumlah, nama_proyek, petugas }) => {
    const qty = toNumber(jumlah);
    if (!barang_id || qty <= 0) throw new Error('Barang dan jumlah produksi wajib valid.');

    await beginTransaction();
    try {
        const rows = await query('SELECT nama_barang, stok FROM stok_barang WHERE id = ?', [barang_id]);
        if (!rows.length) throw new Error('Barang produksi tidak ditemukan.');

        const update = await query(
            'UPDATE stok_barang SET stok = stok - ? WHERE id = ? AND stok >= ?',
            [qty, barang_id, qty]
        );
        if (update.affectedRows === 0) throw new Error('Stok komponen tidak mencukupi.');

        await query(`
            INSERT INTO produksi_detail
                (nama_proyek, barang_id, nama_barang_saat_itu, jumlah_diambil, petugas_produksi)
            VALUES (?, ?, ?, ?, ?)
        `, [nama_proyek, barang_id, rows[0].nama_barang, qty, petugas]);

        await query(`
            INSERT INTO history_log
                (barang_id, nama_barang_saat_itu, aktivitas, jumlah_perubahan, penanggung_jawab)
            VALUES (?, ?, 'Produksi-Keluar', ?, ?)
        `, [barang_id, rows[0].nama_barang, -qty, petugas || null]);

        await commit();
    } catch (err) {
        await rollback();
        throw err;
    }
};

const prosesProduksiTotal = async ({
    nama_proyek,
    petugas,
    produk_nama,
    produk_sku,
    produk_jumlah,
    produk_harga,
    komponen_id,
    komponen_jumlah,
    komponen_harga_satuan,
}) => {
    const ids = toArray(komponen_id);
    const jumlahKomponen = toArray(komponen_jumlah);
    const hargaKomponen = toArray(komponen_harga_satuan);
    const jumlahProduk = toNumber(produk_jumlah);
    const hargaProduk = toNumber(produk_harga);
    const namaProduk = String(produk_nama || '').trim();
    const skuProduk = String(produk_sku || '').trim().toUpperCase();

    if (!nama_proyek || !petugas) throw new Error('Nama proyek dan petugas wajib diisi.');
    if (!namaProduk || !skuProduk || jumlahProduk <= 0) throw new Error('Data produk jadi belum lengkap.');
    if (ids.length === 0) throw new Error('Minimal satu komponen harus dipilih.');
    if (hargaProduk < 0) throw new Error('Harga produk tidak boleh negatif.');

    await beginTransaction();
    try {
        let totalModal = 0;

        for (let i = 0; i < ids.length; i += 1) {
            const id = ids[i];
            const qty = toNumber(jumlahKomponen[i]);
            const hargaInput = toNumber(hargaKomponen[i]);

            if (!id || qty <= 0) throw new Error('Jumlah komponen harus lebih dari 0.');

            const rows = await query(
                'SELECT nama_barang, stok, modal, stok_awal FROM stok_barang WHERE id = ?',
                [id]
            );
            if (!rows.length) throw new Error('Salah satu komponen tidak ditemukan.');

            const barang = rows[0];
            const modalPerUnit = toNumber(barang.stok_awal) > 0
                ? toNumber(barang.modal) / toNumber(barang.stok_awal)
                : hargaInput;

            const update = await query(
                'UPDATE stok_barang SET stok = stok - ? WHERE id = ? AND stok >= ?',
                [qty, id, qty]
            );
            if (update.affectedRows === 0) {
                throw new Error(`Stok ${barang.nama_barang} tidak mencukupi untuk produksi.`);
            }

            totalModal += modalPerUnit * qty;

            await query(`
                INSERT INTO produksi_detail
                    (nama_proyek, barang_id, nama_barang_saat_itu, jumlah_diambil, petugas_produksi)
                VALUES (?, ?, ?, ?, ?)
            `, [nama_proyek, id, barang.nama_barang, qty, petugas]);

            await query(`
                INSERT INTO history_log
                    (barang_id, nama_barang_saat_itu, aktivitas, jumlah_perubahan, penanggung_jawab, harga_satuan_log)
                VALUES (?, ?, 'Produksi-Keluar (Rakit)', ?, ?, ?)
            `, [id, barang.nama_barang, -qty, petugas, modalPerUnit]);
        }

        const result = await query(`
            INSERT INTO stok_barang
                (nama_barang, kode_sku, kondisi, stok_awal, stok, harga_jual, modal)
            VALUES (?, ?, 'BAGUS', ?, ?, ?, ?)
        `, [namaProduk, skuProduk, jumlahProduk, jumlahProduk, hargaProduk, totalModal]);

        await query(`
            INSERT INTO history_log
                (barang_id, nama_barang_saat_itu, aktivitas, jumlah_perubahan, penanggung_jawab, harga_satuan_log)
            VALUES (?, ?, 'Produksi-Masuk (Rakit)', ?, ?, ?)
        `, [result.insertId, namaProduk, jumlahProduk, petugas, hargaProduk]);

        await commit();
    } catch (err) {
        await rollback();
        throw err;
    }
};

const selesaiProduksi = async ({ nama_barang, kode_sku, jumlah, modal_produksi, harga_jual }) => {
    const nama = String(nama_barang || '').trim();
    const sku = String(kode_sku || '').trim().toUpperCase();
    const qty = toNumber(jumlah);
    const modal = toNumber(modal_produksi);
    const harga = toNumber(harga_jual);

    if (!nama || !sku || qty <= 0) throw new Error('Data setoran produksi belum lengkap.');

    const result = await query(`
        INSERT INTO stok_barang
            (nama_barang, kode_sku, kondisi, stok_awal, stok, harga_jual, modal)
        VALUES (?, ?, 'BAGUS', ?, ?, ?, ?)
    `, [nama, sku, qty, qty, harga, modal]);

    await query(`
        INSERT INTO history_log
            (barang_id, nama_barang_saat_itu, aktivitas, jumlah_perubahan, harga_satuan_log)
        VALUES (?, ?, 'Masuk-Produksi', ?, ?)
    `, [result.insertId, nama, qty, harga]);
};

module.exports = {
    getProduksiData,
    ambilBarang,
    prosesProduksiTotal,
    selesaiProduksi,
};
