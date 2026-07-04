/**
 * middleware/auth.js
 * Validasi sesi dan kontrol akses berbasis role.
 *
 * === 3 CUSTOMER SEGMENT / ROLE (v2 - rombak total) ===
 *
 *  1. owner       → Strategis & administratif. Akses penuh: dashboard
 *                   finansial (modal, profit, aset), kelola master barang,
 *                   kelola akun user (BARU), seluruh riwayat & laporan.
 *
 *  2. gudang      → Penjaga stok fisik murni. Bisa: dashboard (tanpa
 *                   finansial), tambah/hapus stok, lihat riwayat stok
 *                   masuk/keluar. Tidak bisa: jual, produksi, master
 *                   barang, kelola akun, data finansial.
 *
 *  3. operasional → Tangan kerja harian. Bisa: dashboard (tanpa
 *                   finansial), transaksi penjualan, modul produksi
 *                   (rakit barang), riwayat penjualan & produksi. Tidak
 *                   bisa: kelola stok fisik, master barang, kelola akun.
 */

/**
 * Middleware: pastikan pengguna sudah login.
 */
const requireAuth = (req, res, next) => {
    if (!req.admin) {
        return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
    }
    next();
};

/**
 * Middleware factory: pastikan role pengguna ada dalam daftar yang diizinkan.
 * Contoh penggunaan: requireRole('owner', 'gudang')
 */
const requireRole = (...roles) => (req, res, next) => {
    if (!req.admin) {
        return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
    }
    if (!roles.includes(req.admin.role)) {
        return res.status(403).render('forbidden', {
            admin: req.admin,
            activePage: '',
        });
    }
    next();
};

module.exports = { requireAuth, requireRole };
