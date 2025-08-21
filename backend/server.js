const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ResultsDatabase } = require('./database');

const app = express();
const PORT = 3001;

// Initialize results database
const resultsDb = new ResultsDatabase();

// CORS configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.sendStatus(200);
});

app.use(bodyParser.json());

// Data files paths (dla users i questions)
const dataDir = path.join(__dirname, 'data');
const questionsFile = path.join(dataDir, 'questions.json');
const usersFile = path.join(dataDir, 'users.json');

// Ensure directories exist
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Hash password function
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Initialize data files
const initDataFile = (filePath, defaultData = []) => {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
};

initDataFile(questionsFile, [
    {
        "id": 1,
        "text": "Jakie są podstawowe zasady bezpieczeństwa w sieci?",
        "maxPoints": 2
    },
    {
        "id": 2,
        "text": "Wymień trzy najważniejsze protokoły sieciowe.",
        "maxPoints": 3
    },
    {
        "id": 3,
        "text": "Co to jest firewall i jakie są jego funkcje?",
        "maxPoints": 3
    },
    {
        "id": 4,
        "text": "Opisz różnice między TCP a UDP.",
        "maxPoints": 4
    },
    {
        "id": 5,
        "text": "Jak działa system DNS?",
        "maxPoints": 3
    }
]);

// Initialize users file with hashed passwords
initDataFile(usersFile, [
    {
        "id": 0,
        "username": "superadmin", 
        "password": hashPassword("superadmin123"),
        "role": "superadmin",
        "name": "Super Administrator"
    },
    {
        "id": 1,
        "username": "admin",
        "password": hashPassword("admin123"),
        "role": "administrator",
        "name": "Administrator"
    },
    {
        "id": 2,
        "username": "teacher",
        "password": hashPassword("teacher123"),
        "role": "cmd",
        "name": "Nauczyciel"
    },
    {
        "id": 3,
        "username": "user",
        "password": hashPassword("user123"),
        "role": "user",
        "name": "Użytkownik"
    }
]);

// Helper functions for JSON files
const readQuestions = () => {
    try {
        const data = fs.readFileSync(questionsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading questions:', error);
        return [];
    }
};

const readUsers = () => {
    try {
        const data = fs.readFileSync(usersFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users:', error);
        return [];
    }
};

const writeUsers = (users) => {
    try {
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing users:', error);
        return false;
    }
};

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', req.body);
  }
  next();
});

// Authentication helper
const verifyToken = async (token) => {
    if (!token || !token.startsWith('token_')) {
        return null;
    }

    const parts = token.split('_');
    if (parts.length === 3) {
        const userId = parseInt(parts[1]);
        const users = readUsers();
        const user = users.find(u => u.id === userId);
        if (user) {
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
    }
    return null;
};

// Get questions (z JSON)
app.get('/api/questions', (req, res) => {
    try {
        const questions = readQuestions();
        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Get all results (z SQLite)
app.get('/api/results', async (req, res) => {
    try {
        const results = await resultsDb.getAllResults();
        
        // Transform results to match frontend format
        const transformedResults = results.map(result => ({
            id: result.id,
            nick: result.nick,
            date: result.date,
            attempt: result.attempt,
            totalPoints: result.total_points,
            maxPoints: result.max_points,
            percentage: result.percentage,
            passed: Boolean(result.passed),
            timestamp: result.timestamp,
            examType: result.exam_type,
            errors: result.errors,
            bonusPoints: result.bonus_points,
            notes: result.notes,
            conductorName: result.conductor_name,
            conductorId: result.conductor_id,
            questionResults: result.question_results ? JSON.parse(result.question_results) : null
        }));

        res.json(transformedResults);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

// Get results by type (z SQLite)
app.get('/api/results/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const results = await resultsDb.getResultsByType(type);
        
        // Transform results to match frontend format
        const transformedResults = results.map(result => ({
            id: result.id,
            nick: result.nick,
            date: result.date,
            attempt: result.attempt,
            totalPoints: result.total_points,
            maxPoints: result.max_points,
            percentage: result.percentage,
            passed: Boolean(result.passed),
            timestamp: result.timestamp,
            examType: result.exam_type,
            errors: result.errors,
            bonusPoints: result.bonus_points,
            notes: result.notes,
            conductorName: result.conductor_name,
            conductorId: result.conductor_id,
            questionResults: result.question_results ? JSON.parse(result.question_results) : null
        }));

        res.json(transformedResults);
    } catch (error) {
        console.error('Error fetching filtered results:', error);
        res.status(500).json({ error: 'Failed to fetch filtered results' });
    }
});

// Add new result (do SQLite)
app.post('/api/results', async (req, res) => {
    try {
        const newResult = req.body;
        
        // Validate required fields
        if (!newResult.nick || !newResult.examType) {
            return res.status(400).json({ error: 'Nick and examType are required' });
        }

        const result = await resultsDb.addResult(newResult);
        
        // Return the created result with the new ID
        const createdResult = {
            id: result.id,
            timestamp: new Date().toISOString(),
            ...newResult
        };
        
        res.status(201).json(createdResult);
    } catch (error) {
        console.error('Error saving result:', error);
        res.status(500).json({ error: 'Failed to save result' });
    }
});

// Delete result by ID (z SQLite)
app.delete('/api/results/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await resultsDb.deleteResult(parseInt(id));
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'Result not found' });
        }
        
        console.log(`Result ${id} deleted successfully`);
        res.json({ message: 'Result deleted successfully' });
    } catch (error) {
        console.error('Error deleting result:', error);
        res.status(500).json({ error: 'Failed to delete result' });
    }
});

// Get statistics (z SQLite)
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await resultsDb.getStats();
        res.json(stats);
    } catch (error) {
        console.error('Error generating stats:', error);
        res.status(500).json({ error: 'Failed to generate statistics' });
    }
});

// Authentication endpoint (z JSON)
app.post('/api/auth/login', (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('=== LOGIN ATTEMPT ===');
        console.log('Received username:', username);
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const users = readUsers();
        const foundUser = users.find(u => u.username === username);
        
        if (!foundUser) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        const hashedPassword = hashPassword(password);
        
        if (foundUser.password === hashedPassword) {
            console.log('✅ Login successful for:', username);
            const { password: _, ...userWithoutPassword } = foundUser;
            res.json({
                success: true,
                user: userWithoutPassword,
                token: `token_${foundUser.id}_${Date.now()}`
            });
        } else {
            console.log('❌ Password mismatch for:', username);
            res.status(401).json({ error: 'Invalid password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Verify token endpoint (z JSON)
app.post('/api/auth/verify', async (req, res) => {
    try {
        const { token } = req.body;
        const user = await verifyToken(token);
        
        if (user) {
            res.json({ valid: true, user });
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(500).json({ error: 'Token verification failed' });
    }
});

// Get all users (z JSON - admin only)
app.get('/api/users', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        
        console.log('GET /api/users - Token:', token);
        
        const user = await verifyToken(token);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        
        console.log('Token verification - User:', user.username, 'Role:', user.role);
        
        if (user.role === 'superadmin' || user.role === 'administrator') {
            const users = readUsers();
            const usersWithoutPasswords = users.map(({ password, ...user }) => user);
            console.log('Returning users:', usersWithoutPasswords.length);
            res.json(usersWithoutPasswords);
        } else {
            console.log('Access denied - not admin');
            res.status(403).json({ error: 'Access denied. Admin role required.' });
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Create user (superadmin only)
app.post('/api/users', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        
        const currentUser = await verifyToken(token);
        
        if (!currentUser || currentUser.role !== 'superadmin') {
            return res.status(403).json({ error: 'Access denied. Superadmin role required.' });
        }

        const { username, password, role, name } = req.body;
        
        // Validate role
        const allowedRoles = ['user', 'cmd', 'administrator'];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        
        if (!username || !password || !role || !name) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const users = readUsers();
        
        // Check if username exists
        if (users.find(u => u.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        
        const newUser = {
            id: nextId,
            username,
            password: hashPassword(password),
            role,
            name
        };

        users.push(newUser);
        
        if (writeUsers(users)) {
            const { password: _, ...userWithoutPassword } = newUser;
            res.status(201).json(userWithoutPassword);
        } else {
            res.status(500).json({ error: 'Failed to save user' });
        }
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update user (superadmin only)
app.put('/api/users/:id', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        
        const currentUser = await verifyToken(token);
        
        if (!currentUser || currentUser.role !== 'superadmin') {
            return res.status(403).json({ error: 'Access denied. Superadmin role required.' });
        }

        const targetUserId = parseInt(req.params.id);
        const { username, password, role, name } = req.body;
        
        const users = readUsers();
        const userIndex = users.findIndex(u => u.id === targetUserId);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (users[userIndex].role === 'superadmin' && targetUserId !== currentUser.id) {
            return res.status(403).json({ error: 'Cannot edit superadmin account' });
        }

        if (username) users[userIndex].username = username;
        if (password) users[userIndex].password = hashPassword(password);
        if (role) users[userIndex].role = role;
        if (name) users[userIndex].name = name;

        if (writeUsers(users)) {
            const { password: _, ...userWithoutPassword } = users[userIndex];
            res.json(userWithoutPassword);
        } else {
            res.status(500).json({ error: 'Failed to update user' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user (superadmin only)
app.delete('/api/users/:id', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        
        const currentUser = await verifyToken(token);
        
        if (!currentUser || currentUser.role !== 'superadmin') {
            return res.status(403).json({ error: 'Access denied. Superadmin role required.' });
        }

        const targetUserId = parseInt(req.params.id);
        
        const users = readUsers();
        const targetUser = users.find(u => u.id === targetUserId);
        
        if (targetUser && targetUser.role === 'superadmin') {
            return res.status(403).json({ error: 'Cannot delete superadmin account' });
        }

        const filteredUsers = users.filter(u => u.id !== targetUserId);
        
        if (filteredUsers.length === users.length) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (writeUsers(filteredUsers)) {
            res.json({ message: 'User deleted successfully' });
        } else {
            res.status(500).json({ error: 'Failed to delete user' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Change password endpoint
app.post('/api/auth/change-password', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        
        const user = await verifyToken(token);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        const users = readUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }

        const currentPasswordHash = hashPassword(currentPassword);
        
        if (users[userIndex].password !== currentPasswordHash) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        users[userIndex].password = hashPassword(newPassword);
        
        if (writeUsers(users)) {
            res.json({ message: 'Password changed successfully' });
        } else {
            res.status(500).json({ error: 'Failed to update password' });
        }
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(), 
        version: '2.0.0-hybrid',
        storage: {
            results: 'SQLite',
            users: 'JSON',
            questions: 'JSON'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Initialize database and start server
async function startServer() {
    try {
        await resultsDb.init();
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`📊 API endpoints available at http://0.0.0.0:${PORT}/api/`);
            console.log(`💾 Storage:`);
            console.log(`   Results: SQLite database (${path.join(__dirname, 'data', 'results.db')})`);
            console.log(`   Users: JSON file (${usersFile})`);
            console.log(`   Questions: JSON file (${questionsFile})`);
            console.log(`🔑 Default accounts:`);
            console.log(`   superadmin / superadmin123`);
            console.log(`   admin / admin123`);
            console.log(`   teacher / teacher123`);
            console.log(`   user / user123`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await resultsDb.close();
    process.exit(0);
});

startServer();