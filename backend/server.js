
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DB_FILE = path.join(__dirname, 'database.json');

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// --- Helper Functions to Interact with the Database File ---
const readDb = () => {
    try {
        if (!fs.existsSync(DB_FILE)) {
            console.log(`Database file not found at ${DB_FILE}. Creating a new one.`);
            fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], dbLog: [] }, null, 2));
        }
        
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        
        if (data.trim() === '') {
            console.log('Database file is empty. Initializing with default structure.');
            return { users: [], dbLog: [] };
        }
        
        return JSON.parse(data);
    } catch (error) {
        console.error(`Critical Error reading or parsing ${DB_FILE}:`, error);
        return { users: [], dbLog: [] };
    }
};

const writeDb = (data) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Critical Error writing to ${DB_FILE}:`, error);
    }
};

// --- API Endpoints ---
app.get('/api/users', (req, res) => {
    console.log(`[${new Date().toISOString()}] GET /api/users`);
    const db = readDb();
    res.json(db.users || []);
});

app.post('/api/users', (req, res) => {
    console.log(`[${new Date().toISOString()}] POST /api/users`);
    const db = readDb();
    db.users = req.body;
    writeDb(db);
    res.status(200).json({ message: 'Users saved successfully' });
});

app.get('/api/dblog', (req, res) => {
    console.log(`[${new Date().toISOString()}] GET /api/dblog`);
    const db = readDb();
    res.json(db.dbLog || []);
});

app.post('/api/dblog', (req, res) => {
    console.log(`[${new Date().toISOString()}] POST /api/dblog`);
    const db = readDb();
    db.dbLog = req.body;
    writeDb(db);
    res.status(200).json({ message: 'Log saved successfully' });
});

// --- Server Initialization ---
app.listen(PORT, () => {
    console.log(`Apex Bank backend server is running on http://localhost:${PORT}`);
    readDb(); // Initialize DB on startup
});