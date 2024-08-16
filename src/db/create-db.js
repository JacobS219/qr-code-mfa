import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./mydatabase.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Promisify db.run
const runAsync = async (sql, params = []) => {
    return new Promise((resolve, reject) => {
        const method = sql.trim().toUpperCase().startsWith("SELECT") ? 'get' : 'run';
        db[method](sql, params, function (err, result) {
            if (err) {
                reject(err);
            } else {
                if (method === 'get') {
                    resolve(result);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            }
        });
    });
};

const initDb = async () => {
    await runAsync(`BEGIN TRANSACTION`);

    try {
        await runAsync(`DROP TABLE IF EXISTS user`);
        await runAsync(`DROP TABLE IF EXISTS reset`);
        await runAsync(`DROP TABLE IF EXISTS token`);

        await runAsync(`CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT,
            last_name TEXT,
            email TEXT UNIQUE,
            password TEXT,
            tfa_secret TEXT DEFAULT ''
        )`);

        await runAsync(`CREATE TABLE IF NOT EXISTS reset (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT,
            token TEXT UNIQUE
        )`);

        await runAsync(`CREATE TABLE IF NOT EXISTS token (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            token TEXT UNIQUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            expires_at DATETIME
        )`);

        await runAsync(`COMMIT`);
    } catch (err) {
        await runAsync(`ROLLBACK`);
        throw err; // Rethrow the error to be handled or logged by the caller
    }
};

export { db, initDb, runAsync };