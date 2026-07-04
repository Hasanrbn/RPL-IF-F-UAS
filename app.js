/**
 * SISTEM MANAJEMEN INVENTARIS BATERAI (v2)
 * Entry point server dan pendaftaran route.
 *
 * === Arsitektur Customer Segment v2 (3 Role - rombak total) ===
 *
 *  ┌─────────────┬───────────────────────────────────────────────────────┐
 *  │  Role       │  Akses & Aktivitas                                    │
 *  ├─────────────┼───────────────────────────────────────────────────────┤
 *  │ owner       │ Strategis & administratif. Dashboard finansial penuh, │
 *  │             │ kelola master barang, KELOLA AKUN USER (baru), lihat  │
 *  │             │ seluruh riwayat, bisa bantu jual/produksi/stok.       │
 *  ├─────────────┼───────────────────────────────────────────────────────┤
 *  │ gudang      │ Penjaga stok fisik. Tambah/hapus stok, riwayat stok   │
 *  │             │ masuk/keluar saja. TIDAK: jual, produksi, master,     │
 *  │             │ kelola akun, data finansial.                          │
 *  ├─────────────┼───────────────────────────────────────────────────────┤
 *  │ operasional │ Tangan kerja harian: transaksi penjualan DAN modul    │
 *  │             │ produksi (rakit barang). Riwayat jual & produksi saja.│
 *  │             │ TIDAK: kelola stok fisik, master barang, kelola akun. │
 *  └─────────────┴───────────────────────────────────────────────────────┘
 *
 *  Kontrol akses diatur di masing-masing file routes/ menggunakan
 *  requireRole() dari middleware/auth.js. Riwayat (/history) tambahan
 *  difilter ISI-nya per role di historyService.js.
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const { sessionMiddleware } = require('./utils/session');
const { requireAuth } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);

// --- Rute publik (tanpa auth) ---
app.use('/', require('./routes/auth'));

// --- Rute terproteksi (semua butuh login; role dicek di dalam masing-masing routes/) ---
app.use('/', requireAuth, require('./routes/dashboard'));
app.use('/', requireAuth, require('./routes/stok'));
app.use('/', requireAuth, require('./routes/transaksi'));
app.use('/history', requireAuth, require('./routes/history'));
app.use('/produksi', requireAuth, require('./routes/produksi'));
app.use('/akun', requireAuth, require('./routes/akun'));

// --- Global error handler ---
app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    res.status(500).send(`
        <h3>Terjadi Kesalahan Server</h3>
        <p>${err.message || 'Kesalahan tidak diketahui.'}</p>
        <p><a href="/">Kembali ke Dashboard</a></p>
    `);
});

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
