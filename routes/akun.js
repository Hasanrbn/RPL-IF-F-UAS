/**
 * routes/akun.js
 * Rute Kelola Akun User — fitur BARU, eksklusif Owner.
 *
 * Mendukung DFD Level 2 proses 6.0:
 *   6.1 Tambah Akun Baru     -> POST /akun/tambah
 *   6.2 Nonaktifkan Akun     -> POST /akun/status/:id
 *   6.3 Ubah Role Akun       -> POST /akun/role/:id
 */

const express = require('express');
const router = express.Router();
const akunController = require('../controllers/akunController');
const { requireRole } = require('../middleware/auth');

const ownerOnly = requireRole('owner');

router.get('/', ownerOnly, akunController.tampilAkun);
router.post('/tambah', ownerOnly, akunController.tambahAkun);
router.post('/status/:id', ownerOnly, akunController.ubahStatus);
router.post('/role/:id', ownerOnly, akunController.ubahRole);

module.exports = router;
