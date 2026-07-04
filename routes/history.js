/**
 * routes/history.js
 * Rute riwayat transaksi.
 *
 * Semua role boleh MENGAKSES halaman ini, tapi ISI yang ditampilkan
 * DIFILTER otomatis sesuai role (lihat historyService.getHistory):
 *   owner       → lihat SEMUA log (stok, jual, produksi)
 *   gudang      → hanya log Stok Masuk & Stok Dihapus
 *   operasional → hanya log Penjualan & Produksi
 */

const express = require('express');
const router = express.Router();
const { tampilHistory } = require('../controllers/historyController');
const { requireRole } = require('../middleware/auth');

router.get('/', requireRole('owner', 'gudang', 'operasional'), tampilHistory);

module.exports = router;
