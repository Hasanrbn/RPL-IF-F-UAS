/**
 * routes/produksi.js
 * Rute modul produksi internal (rakit barang dari komponen).
 *
 * Izin per role (BERUBAH dari versi lama yang admin-only):
 *   owner       → akses penuh, bisa pantau & bantu produksi
 *   operasional → akses penuh, ini tugas utamanya sekarang
 *   gudang      → TIDAK diizinkan (bukan domain pekerjaannya)
 */

const express = require('express');
const router = express.Router();
const {
    tampilProduksi,
    ambilBarang,
    prosesTotal,
    selesaiProduksi,
} = require('../controllers/produksiController');
const { requireRole } = require('../middleware/auth');

const bolehProduksi = requireRole('owner', 'operasional');

router.get('/', bolehProduksi, tampilProduksi);
router.post('/ambil', bolehProduksi, ambilBarang);
router.post('/proses-total', bolehProduksi, prosesTotal);
router.post('/selesai', bolehProduksi, selesaiProduksi);

module.exports = router;
