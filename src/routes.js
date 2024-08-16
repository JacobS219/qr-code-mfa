import { Router } from 'express';
import { AuthenticatedUser, GoogleAuth, Login, Logout, Refresh, Register, TwoFactorAuth } from './controllers/auth.controller.js';
import { ForgotPassword, ResetPassword } from './controllers/forgot.controller.js';

export const routes = (app) => {
    const router = Router();

    router.get('/api/user', AuthenticatedUser)
    router.post('/api/google-auth', GoogleAuth);
    router.post('/api/login', Login);
    router.post('/api/logout', Logout);
    router.post('/api/refresh', Refresh);
    router.post('/api/register', Register);
    router.post('/api/two-factor-auth', TwoFactorAuth);
    router.post('/api/forgot-password', ForgotPassword);
    router.post('/api/reset-password', ResetPassword);

    app.use(router);
};