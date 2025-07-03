
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_FILE = path.join(__dirname, 'database.json');

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// --- Internal Helper Functions ---
const generateNewId = () => Math.random().toString(36).substring(2, 15);

const generateRandomAccountNumber = (length = 12) => {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
};

const generateInitialAccountsForNewUser = (userIdPrefix) => {
    const today = new Date();
    const createDateISO = (year, month, day, hour = 0, minute = 0, second = 0) => 
        new Date(year, month - 1, day, hour, minute, second).toISOString();
    
    const checkingTransactions = [
        { 
            id: generateNewId(), 
            date: createDateISO(today.getFullYear(), today.getMonth() + 1, today.getDate(), 9, 0, 0), 
            description: 'Account Opened', 
            amount: 0, 
            type: 'Credit', 
            category: 'System',
            status: 'Completed',
            userFriendlyId: `TXN-SYS-${generateNewId().slice(0,6).toUpperCase()}`,
            recipientAccountInfo: "Your Account: Primary Checking",
        },
    ];
    
    return [
        {
            id: `${userIdPrefix}-checking1`,
            name: 'Primary Checking',
            type: 'Primary Checking',
            accountNumber: generateRandomAccountNumber(12),
            balance: 0.00,
            transactions: checkingTransactions,
        }
    ];
};


// --- Database Interaction Helpers ---
const readDb = () => {
    try {
        if (!fs.existsSync(DB_FILE)) {
            console.log(`Database file not found at ${DB_FILE}. Creating a new one.`);
            fs.writeFileSync(DB_FILE, JSON.stringify({ users: [], dbLog: [] }, null, 2));
        }
        const data = fs.readFileSync(DB_FILE, 'utf-8');
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

// Root endpoint for deployment status check
app.get('/', (req, res) => {
    res.status(200).send(`Apex National Bank Backend is running. This is the latest version.`);
});

app.get('/api', (req, res) => {
    res.status(200).json({ message: 'Apex National Bank API is running.' });
});

app.get('/api/users', (req, res) => {
    const db = readDb();
    res.json(db.users || []);
});

app.post('/api/users', (req, res) => {
    let db = readDb();
    db.users = req.body;
    writeDb(db);
    res.status(200).json({ message: 'Users saved successfully' });
});

app.get('/api/dblog', (req, res) => {
    const db = readDb();
    res.json(db.dbLog || []);
});

app.post('/api/dblog', (req, res) => {
    let db = readDb();
    db.dbLog = req.body;
    writeDb(db);
    res.status(200).json({ message: 'Log saved successfully' });
});

// LOGIN Endpoint - Final, simplified, and robust version
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    const db = readDb();
    const user = db.users.find(u => 
        (u.username && u.username.toLowerCase() === username.toLowerCase()) ||
        (u.email && u.email.toLowerCase() === username.toLowerCase())
    );

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    if (user.hashedPassword !== password) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const { hashedPassword, ...userToReturn } = user;
    res.status(200).json(userToReturn);
});

// REGISTER Endpoint - Final corrected version
app.post('/api/register', (req, res) => {
    const { username, password_plain, fullName, email, ...rest } = req.body;

    if (!username || !password_plain || !fullName || !email) {
        return res.status(400).json({ message: 'Username, password, full name, and email are required.' });
    }

    const db = readDb();
    if (db.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return res.status(409).json({ message: "Username already exists." });
    }
    if (db.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return res.status(409).json({ message: "Email already registered." });
    }

    const newUserId = `user${Date.now()}`;
    const newUser = {
        id: newUserId,
        username,
        hashedPassword: password_plain,
        fullName,
        email,
        phoneNumber: rest.phoneNumber || "",
        addressLine1: rest.addressLine1 || "",
        city: rest.city || "",
        state: rest.state || "",
        zipCode: rest.zipCode || "",
        createdAt: new Date().toISOString(),
        accounts: generateInitialAccountsForNewUser(newUserId),
        isIdentityVerified: false,
        isAdmin: false,
        linkedCards: [],
        linkedExternalAccounts: [],
        savingsGoals: [],
        payees: [],
        scheduledPayments: [],
        apexCards: [],
        notifications: [{
            id: generateNewId(),
            message: `Welcome to Apex National Bank, ${fullName}!`,
            date: new Date().toISOString(),
            read: false,
            type: 'general'
        }],
        notificationPreferences: { transactions: true, lowBalance: true, securityAlerts: true, promotions: false, appUpdates: true, lowBalanceThreshold: 100 },
        travelNotices: [],
        securitySettings: { is2FAEnabled: false, hasSecurityQuestionsSet: false, isBiometricEnabled: false },
        securityQuestions: [],
        loginHistory: [],
        recognizedDevices: [],
    };
    
    db.users.push(newUser);
    writeDb(db);

    const { hashedPassword, ...userToReturn } = newUser;
    res.status(201).json(userToReturn);
});

// --- Server Initialization ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Apex Bank backend server is running on port: ${PORT}`);
    readDb();
});