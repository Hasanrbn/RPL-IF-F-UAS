/**
 * controllers/historyController.js
 * Controller halaman riwayat transaksi - hasil difilter sesuai role
 * pengguna yang sedang login (lihat historyService.getHistory).
 */

const historyService = require('../services/historyService');

const tampilHistory = async (req, res, next) => {
    try {
        const role = req.admin ? req.admin.role : null;
        const history = await historyService.getHistory(role);
        res.render('history', { history }, (err, html) => {
            if (err) return next(err);
            res.send(html);
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { tampilHistory };
