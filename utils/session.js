const crypto = require('crypto');

const COOKIE_NAME = 'admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 8;

const getSecret = () => process.env.SESSION_SECRET || 'ganti-secret-ini-di-env';

const base64UrlEncode = (value) =>
    Buffer.from(value).toString('base64url');

const base64UrlDecode = (value) =>
    Buffer.from(value, 'base64url').toString('utf8');

const sign = (payload) =>
    crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');

const parseCookies = (cookieHeader = '') => {
    const cookies = {};

    cookieHeader.split(';').forEach((part) => {
        const index = part.indexOf('=');
        if (index === -1) return;

        const key = part.slice(0, index).trim();
        const value = part.slice(index + 1).trim();
        if (key) cookies[key] = decodeURIComponent(value);
    });

    return cookies;
};

const createSessionToken = (admin) => {
    const payload = base64UrlEncode(JSON.stringify({
        id: admin.id,
        username: admin.username,
        nama_lengkap: admin.nama_lengkap,
        role: admin.role,
        exp: Date.now() + (MAX_AGE_SECONDS * 1000),
    }));

    return `${payload}.${sign(payload)}`;
};

const readSessionToken = (token) => {
    if (!token || !token.includes('.')) return null;

    const [payload, signature] = token.split('.');
    const expected = sign(payload);

    // PERBAIKAN: Menggunakan komparasi string yang aman tanpa bentrok masalah panjang byte buffer kustom
    if (signature !== expected) {
        return null;
    }

    try {
        const session = JSON.parse(base64UrlDecode(payload));
        if (!session.exp || session.exp < Date.now()) return null;
        return session;
    } catch (e) {
        return null;
    }
};

const setSessionCookie = (res, admin) => {
    const token = createSessionToken(admin);
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}`);
};

const clearSessionCookie = (res) => {
    res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
};

const sessionMiddleware = (req, res, next) => {
    const cookies = parseCookies(req.headers.cookie);
    req.admin = readSessionToken(cookies[COOKIE_NAME]);
    res.locals.admin = req.admin;
    next();
};

module.exports = {
    setSessionCookie,
    clearSessionCookie,
    sessionMiddleware,
};