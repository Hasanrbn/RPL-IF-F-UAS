/**
 * routes/stok.js
 * Rute manajemen stok dan master barang.
 *
 * Izin per role:
 *   owner  → semua operasi (tambah/hapus master, tambah/hapus stok)
 *   gudang → hanya tambah/hapus stok (tidak bisa kelola master barang)
 *   operasional → TIDAK ada akses (bukan domain pekerjaannya)
 */

const express = require('express');
const router = express.Router();
const stokController = require('../controllers/stokController');
const { requireRole } = require('../middleware/auth');

router.get('/master/hapus/:id', requireRole('owner'), stokController.hapusBarangMaster);
router.post('/master/tambah', requireRole('owner'), stokController.tambahMaster);

router.post('/simpan', requireRole('owner', 'gudang'), stokController.simpanStok);
router.post('/stok/hapus/:id', requireRole('owner', 'gudang'), stokController.hapusStok);

module.exports = router;
