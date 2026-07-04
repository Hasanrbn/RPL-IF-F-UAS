/**
 * routes/transaksi.js
 * Rute penjualan barang.
 *
 * Izin per role:
 *   owner       → bisa jual barang (pengawasan, bisa bantu kapan saja)
 *   operasional → bisa jual barang (tugas utamanya)
 *   gudang      → TIDAK diizinkan (tugasnya stok fisik, bukan jual)
 */

const express = require('express');
const router = express.Router();
const { jualBarang } = require('../controllers/transaksiController');
const { requireRole } = require('../middleware/auth');

router.post('/jual/:id', requireRole('owner', 'operasional'), jualBarang);

module.exports = router;
