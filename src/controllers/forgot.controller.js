import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { runAsync } from "../db/create-db.js";

export const ForgotPassword = async (req, res) => {
    const { email } = req.body;
    const token = randomBytes(16).toString('hex');

    try {
        await runAsync(`INSERT INTO reset (email, token) VALUES (?, ?)`, [email, token]);

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const url = `http://localhost:3000/reset-password/${token}`;

        let info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Reset your password',
            html: `Click <a href="${url}">here</a> to reset your password`,
        });

        console.log('Email sent: ' + info.response); // TODO: remove this in production
        return res.status(200).send({ message: 'Please check your email!' });
    }
    catch (err) {
        console.error(err.message);
        return res.status(500).send({ message: "Error sending email" });
    }
};

export const ResetPassword = async (req, res) => {
    const { token, password, password_confirm } = req.body;

    if (password !== password_confirm) {
        return res.status(400).send({ message: 'Passwords do not match.' });
    }

    try {
        const response = await runAsync(`SELECT * FROM reset WHERE token = ?`, [token]);
        if (!response) {
            return res.status(404).send({ message: 'Invalid link or token has expired.' });
        }

        const user = await runAsync(`SELECT * FROM user WHERE email = ?`, [response.email]);
        if (!user) {
            return res.status(404).send({ message: 'Invalid link.' });
        }

        const encryptedPassword = await bcrypt.hash(password, 12);
        await runAsync(`UPDATE user SET password = ? WHERE email = ?`, [encryptedPassword, user.email]);

        await runAsync(`DELETE FROM reset WHERE token = ?`, [token]);
        return res.status(200).send({ message: 'Password updated successfully.' });
    } catch (err) {
        console.error(err.message); // Consider more granular error handling
        return res.status(500).send({ message: 'Error updating password.' });
    }
};
