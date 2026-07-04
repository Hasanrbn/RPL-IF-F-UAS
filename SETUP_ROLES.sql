-- ==========================================================================
-- SETUP CUSTOMER SEGMENT / ROLE — v2 (ROMBAK TOTAL)
-- Sistem Manajemen Inventaris Baterai
-- ==========================================================================
--
-- 3 Role v2 yang diimplementasikan:
--
--   1. owner       -> Strategis & administratif. Akses penuh termasuk
--                     fitur BARU "Kelola Akun User".
--   2. gudang      -> Penjaga stok fisik murni.
--   3. operasional -> Tangan kerja harian: penjualan DAN produksi
--                     (gabungan peran "kasir" + "produksi" versi lama).
--
-- MIGRASI DARI v1 (admin/gudang/kasir) -> v2 (owner/gudang/operasional):
--   admin -> owner
--   gudang -> gudang (tidak berubah)
--   kasir -> operasional
-- ==========================================================================

-- Jika sebelumnya memakai skema v1, jalankan migrasi nilai role berikut:
UPDATE akun_admin SET role = 'owner'       WHERE role = 'admin';
UPDATE akun_admin SET role = 'operasional' WHERE role = 'kasir';

-- Jika tabel akun_admin belum punya kolom role, tambahkan dulu:
ALTER TABLE akun_admin
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'gudang'
  AFTER username;

-- ==========================================================================
-- Contoh INSERT akun untuk masing-masing role v2
-- (Ganti hash bcrypt dengan hasil generate dari bcryptjs, atau buat
--  langsung lewat fitur "Kelola Akun" di /akun setelah login sebagai owner)
-- ==========================================================================

-- Cara generate hash baru di Node.js:
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('PASSWORD_YANG_DIINGINKAN', 10, (err, hash) => console.log(hash));

-- Akun Owner (akses penuh + kelola akun) — WAJIB ada minimal 1 untuk
-- bisa membuat akun gudang/operasional lewat UI /akun
INSERT INTO akun_admin (username, role, password, nama_lengkap, status)
VALUES (
  'owner',
  'owner',
  '$2b$10$GANTIINIKOLOMHASHBCRYPTNYAUNTUKOWNER',
  'Pemilik Toko',
  'Aktif'
)
ON DUPLICATE KEY UPDATE role = 'owner';

-- Akun Staff Gudang (kelola stok fisik, lihat riwayat stok)
INSERT INTO akun_admin (username, role, password, nama_lengkap, status)
VALUES (
  'gudang1',
  'gudang',
  '$2b$10$GANTIINIKOLOMHASHBCRYPTNYAUNTUKGUDANG',
  'Budi Gudang',
  'Aktif'
)
ON DUPLICATE KEY UPDATE role = 'gudang';

-- Akun Operasional (jual barang + jalankan produksi)
INSERT INTO akun_admin (username, role, password, nama_lengkap, status)
VALUES (
  'operasional1',
  'operasional',
  '$2b$10$GANTIINIKOLOMHASHBCRYPTNYAUNTUKOPERASIONAL',
  'Siti Operasional',
  'Aktif'
)
ON DUPLICATE KEY UPDATE role = 'operasional';

-- ==========================================================================
-- Verifikasi
-- ==========================================================================
SELECT id, username, role, nama_lengkap, status FROM akun_admin;
