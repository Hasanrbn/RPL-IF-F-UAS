/**
 * routes/dashboard.js
 * Route untuk halaman utama (Dashboard Inventaris).
 */

const express = require('express');
const router  = express.Router();
const { tampilDashboard } = require('../controllers/dashboardController');

router.get('/', tampilDashboard);

module.exports = router;
