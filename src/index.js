import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { initDb } from './db/create-db.js';
import { routes } from './routes.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://localhost:4200'],
    credentials: true
}));

initDb().catch(err => { console.error("Error initializing the database:", err.message) });

routes(app);

const HOST = '0.0.0.0';
const PORT = 8000;

app.listen(PORT, HOST, () => { console.log(`Server running on http://${HOST}:${PORT}`); })