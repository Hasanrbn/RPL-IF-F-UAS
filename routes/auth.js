/**
 * routes/auth.js
 */
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/login', authController.tampilLogin);
router.post('/login', authController.prosesLogin);

// KUNCI UTAMA: Pastikan di sini tertulis .post, bukan .get
router.post('/logout', authController.logout); 

module.exports = router;