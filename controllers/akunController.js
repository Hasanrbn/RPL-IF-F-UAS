/**
 * controllers/akunController.js
 * Controller untuk fitur Kelola Akun User (khusus Owner).
 */

const akunService = require('../services/akunService');

const tampilAlert = (res, pesan, tujuan = '/akun') => res.send(`
    <script>
        alert(${JSON.stringify(pesan)});
        window.location.href = ${JSON.stringify(tujuan)};
    </script>
`);

const tampilAkun = async (req, res, next) => {
    try {
        const users = await akunService.getAllUsers();
        res.render('akun', { users }, (err, html) => {
            if (err) return next(err);
            res.send(html);
        });
    } catch (err) {
        next(err);
    }
};

const tambahAkun = async (req, res, next) => {
    try {
        await akunService.tambahAkun(req.body);
        res.redirect('/akun');
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return tampilAlert(res, err.message);
        }
        if (err.message && !err.sqlMessage) {
            return tampilAlert(res, err.message);
        }
        next(err);
    }
};

const ubahStatus = async (req, res, next) => {
    try {
        await akunService.ubahStatus(req.params.id, req.body.status);
        res.redirect('/akun');
    } catch (err) {
        next(err);
    }
};

const ubahRole = async (req, res, next) => {
    try {
        await akunService.ubahRole(req.params.id, req.body.role);
        res.redirect('/akun');
    } catch (err) {
        if (err.message) {
            return tampilAlert(res, err.message);
        }
        next(err);
    }
};

module.exports = { tampilAkun, tambahAkun, ubahStatus, ubahRole };
