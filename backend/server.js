const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { Database, hashPassword } = require('./database');

const app = express();
const PORT = 3001;

// Initialize database
const db = new Database();

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

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

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
        return await db.getUserById(userId);
    }
    return null;
};

// Get questions
app.get('/api/questions', async (req, res) => {
    try {
        const questions = await db.getAllQuestions();
        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Get all results
app.get('/api/results', async (req, res) => {
    try {
        const results = await db.getAllResults();
        
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
            conductorId: result.conductor_id?.toString(),
            questionResults: result.question_results ? JSON.parse(result.question_results) : null
        }));

        res.json(transformedResults);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

// Get results by type
app.get('/api/results/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const results = await db.getResultsByType(type);
        
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
            conductorId: result.conductor_id?.toString(),
            questionResults: result.question_results ? JSON.parse(result.question_results) : null
        }));

        res.json(transformedResults);
    } catch (error) {
        console.error('Error fetching filtered results:', error);
        res.status(500).json({ error: 'Failed to fetch filtered results' });
    }
});

// Add new result
app.post('/api/results', async (req, res) => {
    try {
        const newResult = req.body;
        
        // Validate required fields
        if (!newResult.nick || !newResult.examType) {
            return res.status(400).json({ error: 'Nick and examType are required' });
        }

        const result = await db.addResult(newResult);
        
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

// Delete result by ID
app.delete('/api/results/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.deleteResult(parseInt(id));
        
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

// Get statistics
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await db.getStats();
        res.json(stats);
    } catch (error) {
        console.error('Error generating stats:', error);
        res.status(500).json({ error: 'Failed to generate statistics' });
    }
});

// Authentication endpoint
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('=== LOGIN ATTEMPT ===');
        console.log('Received username:', username);
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const foundUser = await db.getUserByUsername(username);
        
        if (!foundUser) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        const hashedPassword = hashPassword(password);
        
        if (foundUser.password_hash === hashedPassword) {
            console.log('✅ Login successful for:', username);
            const userResponse = {
                id: foundUser.id,
                username: foundUser.username,
                role: foundUser.role,
                name: foundUser.name
            };
            res.json({
                success: true,
                user: userResponse,
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

// Verify token endpoint
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

// Get all users (admin only)
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
            const users = await db.getAllUsers();
            console.log('Returning users:', users.length);
            res.json(users);
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

        // Check if username exists
        const existingUser = await db.getUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const result = await db.addUser({ username, password, role, name });
        const newUser = await db.getUserById(result.id);
        
        res.status(201).json(newUser);
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
        
        const targetUser = await db.getUserById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Prevent editing other superadmin accounts
        const fullTargetUser = await db.get("SELECT * FROM users WHERE id = ?", [targetUserId]);
        if (fullTargetUser.role === 'superadmin' && targetUserId !== currentUser.id) {
            return res.status(403).json({ error: 'Cannot edit superadmin account' });
        }

        const updateData = { username, role, name };
        if (password) {
            updateData.password = password;
        }

        await db.updateUser(targetUserId, updateData);
        const updatedUser = await db.getUserById(targetUserId);
        
        res.json(updatedUser);
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
        
        // Prevent deleting superadmin accounts
        const targetUser = await db.get("SELECT * FROM users WHERE id = ?", [targetUserId]);
        if (targetUser && targetUser.role === 'superadmin') {
            return res.status(403).json({ error: 'Cannot delete superadmin account' });
        }

        const result = await db.deleteUser(targetUserId);
        
        if (result.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
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

        // Verify current password
        const fullUser = await db.get("SELECT * FROM users WHERE id = ?", [user.id]);
        const currentPasswordHash = hashPassword(currentPassword);
        
        if (fullUser.password_hash !== currentPasswordHash) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        await db.changePassword(user.id, newPassword);
        res.json({ message: 'Password changed successfully' });
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
        version: '2.0.0',
        database: 'SQLite'
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
        await db.init();
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Server running on port ${PORT}`);
            console.log(`📊 API endpoints available at http://0.0.0.0:${PORT}/api/`);
            console.log(`💾 SQLite database located at: ${path.join(__dirname, 'data', 'exams.db')}`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    await db.close();
    process.exit(0);
});

startServer();