/**
 * Controller untuk penjualan barang dari gudang.
 */

const transaksiService = require('../services/transaksiService');

const jualBarang = async (req, res, next) => {
    try {
        const id = req.params.id;
        const jumlahJual = Number.parseInt(req.body.jumlah_jual, 10);

        if (!Number.isInteger(jumlahJual) || jumlahJual <= 0) {
            return res.send(`
                <script>
                    alert("Jumlah penjualan harus lebih dari 0.");
                    window.location.href = "/";
                </script>
            `);
        }

        const berhasil = await transaksiService.jualBarang(id, jumlahJual, req.admin);

        if (!berhasil) {
            return res.send(`
                <script>
                    alert("Gagal! Stok tidak mencukupi atau barang tidak ditemukan.");
                    window.location.href = "/";
                </script>
            `);
        }

        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

module.exports = { jualBarang };
