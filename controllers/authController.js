/**
 * controllers/authController.js
 */
const authService = require('../services/authService');
const { setSessionCookie, clearSessionCookie } = require('../utils/session');

const tampilLogin = (req, res) => {
    res.render('login', {
        error: req.query.error === '1' ? 'Username atau password salah, atau akun tidak aktif.' : null,
        next: req.query.next || '/',
    });
};

const prosesLogin = async (req, res, next) => {
    try {
        // === TAMBAHKAN BARIS DEBUG INI ===
        console.log("==========================================");
        console.log("DATA YANG DIKIRIM FORM:", req.body);
        
        const admin = await authService.login(req.body.username, req.body.password);
        
        console.log("HASIL SETELAH DI-CEK DATABASE:", admin);
        console.log("==========================================");
        // =================================

        const nextUrl = req.body.next && req.body.next.startsWith('/') ? req.body.next : '/';

        if (!admin) {
            return res.redirect(`/login?error=1&next=${encodeURIComponent(nextUrl)}`);
        }

        setSessionCookie(res, admin);
        return res.redirect(nextUrl);
    } catch (err) {
        next(err);
    }
};

const logout = (req, res) => {
    clearSessionCookie(res);
    res.redirect('/login');
};

// PASTIKAN BAGIAN EKSPOR INI SAMA PERSIS DENGAN YANG DIPANGGIL DI ROUTER
module.exports = { 
    tampilLogin, 
    prosesLogin, 
    logout 
};