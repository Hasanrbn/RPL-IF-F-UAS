/**
 * controllers/produksiController.js
 * Mengatur semua aksi di modul produksi internal.
 */

const produksiService = require('../services/produksiService');

const tampilProduksi = async (req, res, next) => {
    try {
        const data = await produksiService.getProduksiData();
        res.render('produksi', data, (err, html) => {
            if (err) return next(err);
            res.send(html);
        });
    } catch (err) {
        next(err);
    }
};

const ambilBarang = async (req, res, next) => {
    try {
        await produksiService.ambilBarang(req.body);
        res.redirect('/produksi');
    } catch (err) {
        next(err);
    }
};

const prosesTotal = async (req, res, next) => {
    try {
        await produksiService.prosesProduksiTotal(req.body);
        res.redirect('/history');
    } catch (err) {
        next(err);
    }
};

const selesaiProduksi = async (req, res, next) => {
    try {
        await produksiService.selesaiProduksi(req.body);
        res.redirect('/');
    } catch (err) {
        next(err);
    }
};

module.exports = { tampilProduksi, ambilBarang, prosesTotal, selesaiProduksi };
