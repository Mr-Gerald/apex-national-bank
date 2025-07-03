
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
// Use the port provided by the environment (for Render) or 3001 for local dev
const PORT = process.env.PORT || 3001;
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
    let db = readDb();
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
    let db = readDb();
    db.dbLog = req.body;
    writeDb(db);
    res.status(200).json({ message: 'Log saved successfully' });
});

app.post('/api/login', (req, res) => {
    console.log(`[${new Date().toISOString()}] POST /api/login`);
    const { username, password, ipAddress, deviceAgent } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const db = readDb();
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    if (user.hashedPassword !== password) {
         if(!user.isAdmin) {
            const failedLoginAttempt = { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), ipAddress, status: "Failed - Incorrect Password", deviceInfo: deviceAgent };
            user.loginHistory = [failedLoginAttempt, ...(user.loginHistory || [])].slice(0,20);
            writeDb(db);
        }
        return res.status(401).json({ message: 'Invalid username or password.' });
    }

    // --- Handle successful login ---
    if(!user.isAdmin) {
        const successfulLoginAttempt = { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), ipAddress, status: "Success", deviceInfo: deviceAgent };
        user.loginHistory = [successfulLoginAttempt, ...(user.loginHistory || [])].slice(0,20);

        const existingDeviceIndex = user.recognizedDevices?.findIndex(d => d.userAgent === deviceAgent && d.ipAddress.split('.').slice(0,3).join('.') === ipAddress.split('.').slice(0,3).join('.'));

        if (existingDeviceIndex > -1 && user.recognizedDevices) {
            user.recognizedDevices[existingDeviceIndex].lastLogin = new Date().toISOString();
            user.recognizedDevices[existingDeviceIndex].ipAddress = ipAddress;
        } else if (!user.recognizedDevices?.some(d=> d.name.includes("Device") && d.userAgent === deviceAgent ) ) { 
             const newDevice = { id: `dev-${Date.now()}`, name: `Device (${deviceAgent.substring(0,20)}...)`, lastLogin: new Date().toISOString(), ipAddress, userAgent: deviceAgent };
            user.recognizedDevices = [newDevice, ...(user.recognizedDevices || [])].slice(0,5);
        }
        writeDb(db);
    }
    
    // Don't send the password back to the client
    const { hashedPassword, ...userToReturn } = user;
    res.status(200).json(userToReturn);
});


// --- Server Initialization ---
app.listen(PORT, () => {
    console.log(`Apex Bank backend server is running on port: ${PORT}`);
    readDb(); // Initialize DB on startup
});