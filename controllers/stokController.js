/**
 * Controller untuk master barang dan stok gudang.
 */

const stokService = require('../services/stokService');

const tampilAlert = (res, pesan, tujuan = '/') => res.send(`
    <script>
        alert(${JSON.stringify(pesan)});
        window.location.href = ${JSON.stringify(tujuan)};
    </script>
`);

const tambahMaster = async (req, res, next) => {
    try {
        const { nama_barang, kode_sku } = req.body;
        await stokService.tambahMaster(nama_barang, kode_sku);
        res.redirect('/');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return tampilAlert(res, 'Gagal! Nama barang atau SKU sudah terdaftar.');
        }
        next(err);
    }
};

const simpanStok = async (req, res, next) => {
    try {
        await stokService.simpanStok(req.body, req.admin);
        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

const hapusStok = async (req, res, next) => {
    try {
        await stokService.hapusStok(req.params.id, req.admin);
        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

const hapusBarangMaster = async (req, res, next) => {
    try {
        const idBarang = req.params.id; // Mengambil ID dari URL /master/hapus/3
        
        if (!idBarang) {
            return res.redirect('/?error=id_tidak_ditemukan');
        }

        await stokService.hapusBarangMaster(idBarang);
        
        // Setelah sukses menghapus, kembalikan admin ke halaman utama
        return res.redirect('/'); 
    } catch (err) {
        next(err);
    }
};

module.exports = { tambahMaster, simpanStok, hapusStok, hapusBarangMaster };
