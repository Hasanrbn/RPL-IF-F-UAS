# Sistem Customer Segment v2 (Rombak Total)

Versi ini mengganti total skema role dari **admin / gudang / kasir** menjadi
**owner / gudang / operasional**, dengan satu fitur baru: **Kelola Akun User**.

---

## Mengapa dirombak?

| Versi lama | Versi baru | Alasan |
|---|---|---|
| `admin` | `owner` | Lebih jelas merepresentasikan pemilik bisnis yang fokus strategis & finansial |
| `kasir` (jual saja) | `operasional` (jual **+** produksi) | Penjualan dan produksi sama-sama aktivitas operasional harian — satu staf bisa rangkap keduanya |
| `gudang` | `gudang` | Tidak berubah, tetap fokus stok fisik |
| *(tidak ada)* | **Kelola Akun User** | Fitur administratif baru: owner kini bisa membuat & mengatur akun staff langsung dari aplikasi, bukan manual lewat database |

---

## Ringkasan Akses

| Fitur | owner | gudang | operasional |
|---|:---:|:---:|:---:|
| Dashboard (data stok) | v | v | v |
| Dashboard (modal, profit, aset) | v | x | x |
| Kelola master barang (SKU) | v | x | x |
| Input / hapus stok fisik | v | v | x |
| Transaksi penjualan | v | x | v |
| Modul produksi (rakit barang) | v | x | v |
| Riwayat stok masuk/keluar | v | v | x |
| Riwayat penjualan & produksi | v | x | v |
| **Kelola akun user** | **v** | x | x |

---

## Detail Per Role

### Owner
**Tugas:** Mengawasi bisnis secara strategis dan finansial, mengelola siapa saja yang punya akses ke sistem.
- Satu-satunya yang melihat modal, profit, dan nilai aset gudang
- Satu-satunya yang bisa kelola master barang (katalog SKU)
- Satu-satunya yang bisa membuat akun baru, ubah role, dan menonaktifkan akun staff
- Bisa membantu jual barang dan menjalankan produksi kapan pun diperlukan
- Melihat seluruh riwayat (stok, penjualan, produksi) tanpa filter

### Gudang
**Tugas:** Menjaga akurasi stok fisik di gudang.
- Tambah stok masuk dari supplier, hapus stok (salah input/rusak)
- Riwayat yang terlihat **hanya** log Stok Masuk & Stok Dihapus
- Tidak melihat data finansial, tidak bisa jual, tidak bisa produksi

### Operasional
**Tugas:** Menjalankan aktivitas harian yang berhubungan langsung dengan pelanggan dan lini produksi — gabungan peran "kasir" dan "tim produksi" versi lama.
- Proses transaksi penjualan ke pelanggan
- Menjalankan modul produksi (rakit barang dari komponen)
- Riwayat yang terlihat **hanya** log Penjualan & Produksi
- Tidak bisa tambah/hapus stok fisik, tidak bisa kelola master barang

---

## Fitur Baru: Kelola Akun User

Route: `/akun` (owner-only)

| Aksi | Endpoint | Deskripsi |
|---|---|---|
| Lihat daftar akun | `GET /akun` | Tabel semua akun + role + status |
| Tambah akun baru | `POST /akun/tambah` | Buat akun gudang/operasional/owner baru (password di-hash bcrypt) |
| Ubah role akun | `POST /akun/role/:id` | Pindahkan akun ke role lain via dropdown |
| Nonaktifkan/aktifkan akun | `POST /akun/status/:id` | Toggle status tanpa menghapus data (jaga integritas riwayat) |

Owner tidak bisa mengubah role atau menonaktifkan akunnya sendiri lewat UI ini (dicegah di view) untuk menghindari owner terkunci dari sistemnya sendiri.

---

## Riwayat Otomatis Terfilter per Role

`historyService.getHistory(role)` memfilter `history_log` berdasarkan `aktivitas`:

```javascript
// gudang hanya melihat:
['Stok Masuk', 'Stok Dihapus']

// operasional hanya melihat:
['Penjualan', 'Produksi-Keluar', 'Produksi-Keluar (Rakit)',
 'Produksi-Masuk (Rakit)', 'Masuk-Produksi']

// owner: tanpa filter, lihat semua
```

Ini berbeda dari kontrol akses biasa (`requireRole`) — di sini SEMUA role boleh
membuka halaman `/history`, tapi ISI tabelnya otomatis berbeda sesuai siapa
yang login.

---

## Cara Kerja Teknis (tidak berubah dari v1)

### Middleware `requireRole`
```javascript
const { requireRole } = require('../middleware/auth');
router.post('/jual/:id', requireRole('owner', 'operasional'), jualBarang);
```

### Kontrol di View (EJS)
```ejs
<% if (admin && admin.role === 'owner') { %>
  <!-- Konten khusus owner -->
<% } %>
```

### Database
Tabel `akun_admin` (nama tabel dipertahankan untuk kompatibilitas) kini
menyimpan nilai `role` berupa `'owner'`, `'gudang'`, atau `'operasional'`.
Lihat `SETUP_ROLES.sql` untuk migrasi dari skema v1.
