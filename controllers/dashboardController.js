/**
 * Controller halaman dashboard inventaris.
 */

const stokService = require('../services/stokService');

const tampilDashboard = async (req, res, next) => {
    try {
        const data = await stokService.getDashboardData();
        res.render('index', data, (err, html) => {
            if (err) return next(err);
            res.send(html);
        });
    } catch (err) {
        next(err);
    }
};

module.exports = { tampilDashboard };
