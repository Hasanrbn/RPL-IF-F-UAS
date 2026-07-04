# Sistem Manajemen Inventaris Baterai

Aplikasi web berbasis Node.js, Express, EJS, dan MySQL untuk mengelola stok gudang baterai, penjualan, riwayat transaksi, dan produksi internal.

## Struktur Folder

```text
proyek-baterai/
├── app.js
├── .env
├── package.json
├── config/
│   └── database.js
├── routes/
│   ├── dashboard.js
│   ├── stok.js
│   ├── transaksi.js
│   ├── history.js
│   └── produksi.js
├── controllers/
├── services/
├── views/
│   ├── partials/
│   ├── index.ejs
│   ├── history.ejs
│   └── produksi.ejs
└── public/
    ├── css/
    └── js/
```

## Cara Menjalankan

1. Install dependencies:

```bash
npm install
```

2. Konfigurasi `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=db_baterai
```

3. Jalankan aplikasi:

```bash
npm start
```

Mode development:

```bash
npm run dev
```

Buka `http://localhost:3000`.

## Tabel Database

| Tabel | Keterangan |
| --- | --- |
| `master_barang` | Daftar barang untuk pilihan input stok |
| `stok_barang` | Data stok aktual di gudang |
| `history_log` | Log perubahan stok, penjualan, dan produksi |
| `produksi_detail` | Detail komponen yang dipakai produksi |

## Endpoint Utama

| Metode | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/` | Dashboard inventaris |
| POST | `/tambah-master` | Tambah master barang |
| POST | `/simpan` | Tambah stok masuk |
| POST | `/jual/:id` | Catat penjualan |
| POST | `/hapus/:id` | Hapus baris stok |
| GET | `/history` | Riwayat transaksi |
| GET | `/produksi` | Halaman produksi |
| POST | `/produksi/proses-total` | Proses perakitan produk |
