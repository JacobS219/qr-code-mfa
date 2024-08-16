import bcrypt from 'bcrypt';
import { OAuth2Client } from "google-auth-library";
import speakeasy from 'speakeasy';
import jwt from 'jsonwebtoken';
const { sign, verify } = jwt;
import { runAsync } from "../db/create-db.js";

export const AuthenticatedUser = async (req, res) => {
    const cookie = req.cookies['access_token'];

    if (!cookie) { return res.status(401).send({ message: 'unauthenticated' }); }

    try {
        const decoded = verify(cookie, process.env.ACCESS_SECRET || '');

        if (!decoded) { return res.status(401).send({ message: 'unauthenticated' }); }

        const user = await runAsync(`SELECT id, first_name, last_name, email FROM user WHERE id = ?`, [decoded.id]);

        if (!user) { return res.status(401).send({ message: 'unauthenticated' }); }

        res.status(200).send(user);
    }
    catch (err) {
        console.error(err.message);
        return res.status(401).send({ message: 'unauthenticated' });
    }
};

export const GoogleAuth = async (req, res) => {
    const { token } = req.body;

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        const { sub, email, given_name, family_name } = payload;

        if (!payload) { return res.status(401).send({ message: 'unauthenticated' }); }

        let user = await runAsync(`SELECT id, first_name, last_name, email FROM user WHERE email = ?`, [email]);

        if (!user) {
            const insertResult = await runAsync(`INSERT INTO user (first_name, last_name, email, password) VALUES (?, ?, ?, ?)`, [given_name, family_name, email, await bcrypt.hash(sub, 12)]);
            user = await runAsync(`SELECT id, first_name, last_name, email FROM user WHERE id = ?`, [insertResult.lastID]);
        }

        const access_token = sign({ id: user.id }, process.env.ACCESS_SECRET, { expiresIn: '30s' });
        const refresh_token = sign({ id: user.id }, process.env.REFRESH_SECRET, { expiresIn: '1w' });

        res.cookie('access_token', access_token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });
        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        });

        res.status(200).send({
            message: 'Login successful',
            user: user
        });
    }
    catch (err) {
        console.error(err.message);
        return res.status(500).send({ message: 'Error Google login.' });
    }
};

export const Login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) { return res.status(400).send({ message: 'Please provide all the required fields.' }); }

    try {
        const user = await runAsync(`SELECT * FROM user WHERE email = ?`, [email]);

        if (!user) { return res.status(400).send({ message: 'Invalid credentials.' }); }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) { return res.status(400).send({ message: 'Invalid credentials.' }); }

        if (user.tfa_secret) { return res.send({ id: user.id }); }

        const secret = speakeasy.generateSecret({ name: 'Test App' });

        res.send({
            id: user.id,
            secret: secret.ascii,
            otpauth_url: secret.otpauth_url,
        });
    }
    catch (err) {
        console.error(err.message);
        return res.status(500).send({ message: 'Error logging in.' });
    }
};

export const Logout = async (req, res) => {
    res.cookie('access_token', '', {
        httpOnly: true,
        maxAge: 0,
    });

    res.cookie('refresh_token', '', {
        httpOnly: true,
        maxAge: 0,
    });

    return res.status(200).send({
        message: 'success',
    });
};

export const Refresh = async (req, res) => {
    const cookie = req.cookies['refresh_token'];

    if (!cookie) { return res.status(401).send({ message: 'unauthenticated' }); }

    try {
        const decoded = verify(cookie, process.env.REFRESH_SECRET || '');

        if (!decoded) { return res.status(401).send({ message: 'unauthenticated' }); }

        const accessToken = sign({
            id: decoded.id,
        }, process.env.ACCESS_SECRET, { expiresIn: '30s' });

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        return res.status(200).send({ message: 'success' });
    }
    catch (err) {
        console.error(err.message);
        return res.status(401).send({ message: 'unauthenticated' });
    }
};

export const Register = async (req, res) => {
    const { first_name, last_name, email, password, password_confirm } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).send({ message: 'Please provide all the required fields.' });
    }

    if (password !== password_confirm) { return res.status(400).send({ message: 'Passwords do not match.' }); }

    try {
        const encryptedPassword = await bcrypt.hash(password, 12);

        const insertResult = await runAsync(`INSERT INTO user (first_name, last_name, email, password) VALUES (?, ?, ?, ?)`, [first_name, last_name, email, encryptedPassword]);

        const user = await runAsync(`SELECT id, first_name, last_name, email FROM user WHERE id = ?`, [insertResult.lastID]);

        return res.status(201).send({
            message: 'User created successfully.',
            user: user
        });
    }
    catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
            console.error(err);
            return res.status(400).send({ message: 'User already exists.' });
        } else {
            console.error(err);
            return res.status(500).send({ message: 'Error registering user.' });
        }
    }
};

export const TwoFactorAuth = async (req, res) => {
    try {
        const id = req.body.id;

        const user = await runAsync(`SELECT * FROM user WHERE id = ?`, [id]);

        if (!user) { return res.status(400).send({ message: 'Invalid credentials.' }); }

        const secret = user.tfa_secret !== '' ? user.tfa_secret : req.body.secret;

        const verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'ascii',
            token: req.body.code,
        });

        if (!verified) { return res.status(400).send({ message: 'Invalid credentials.' }); }

        if (user.tfa_secret === '') {
            await runAsync(`UPDATE user SET tfa_secret = ? WHERE id = ?`, [secret, id]);
        }

        const accessToken = sign({ id }, process.env.ACCESS_SECRET, { expiresIn: '30s' });
        const refreshToken = sign({ id }, process.env.REFRESH_SECRET, { expiresIn: '1w' });

        res.cookie('access_token', accessToken, {
            httpOnly: true, // Prevents javascript from accessing the cookie
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        });

        return res.status(200).send({ message: 'Success' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error with 2FA.' });
    }
};