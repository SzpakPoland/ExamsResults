const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://162.19.246.158:3000',
    'https://egzaminy.mikolajhamerski.pl'
  ],
  credentials: true
}));
app.use(bodyParser.json());

// Data files paths
const dataDir = path.join(__dirname, 'data');
const resultsFile = path.join(dataDir, 'results.json');
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

initDataFile(resultsFile);
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
        "role": "admin",
        "name": "Administrator"
    },
    {
        "id": 2,
        "username": "teacher",
        "password": hashPassword("teacher123"),
        "role": "teacher",
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

// Helper functions
const readResults = () => {
    try {
        const data = fs.readFileSync(resultsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading results:', error);
        return [];
    }
};

const readQuestions = () => {
    try {
        const data = fs.readFileSync(questionsFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading questions:', error);
        return [];
    }
};

const writeResults = (results) => {
    try {
        fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing results:', error);
        return false;
    }
};

// Helper function to read users
const readUsers = () => {
    try {
        const data = fs.readFileSync(usersFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading users:', error);
        return [];
    }
};

// Helper function to write users
const writeUsers = (users) => {
    try {
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing users:', error);
        return false;
    }
};

// Helper function to calculate grade
const calculateGrade = (errors, bonusPoints, totalQuestions) => {
    const basePoints = totalQuestions - errors;
    const totalPoints = basePoints + bonusPoints;
    const maxPoints = totalQuestions + bonusPoints; // Dodaj bonusy do puli wszystkich punktów
    const percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
    const passed = percentage >= 75;
    
    return {
        errors,
        bonusPoints: bonusPoints || 0,
        totalPoints,
        maxPoints,
        percentage: Math.round(percentage * 100) / 100,
        passed
    };
};

// Get questions
app.get('/api/questions', (req, res) => {
    try {
        const questions = readQuestions();
        res.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ error: 'Failed to fetch questions' });
    }
});

// Get all results
app.get('/api/results', (req, res) => {
    try {
        const results = readResults();
        res.json(results);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: 'Failed to fetch results' });
    }
});

// Get results by type
app.get('/api/results/:type', (req, res) => {
    try {
        const { type } = req.params;
        const allResults = readResults();
        const filteredResults = allResults.filter(result => result.examType === type);
        res.json(filteredResults);
    } catch (error) {
        console.error('Error fetching filtered results:', error);
        res.status(500).json({ error: 'Failed to fetch filtered results' });
    }
});

// Add new result
app.post('/api/results', (req, res) => {
    try {
        const newResult = req.body;
        
        // Validate required fields
        if (!newResult.nick || !newResult.examType) {
            return res.status(400).json({ error: 'Nick and examType are required' });
        }

        // Read existing results
        const results = readResults();
        
        // Add new result with timestamp and ID if not provided
        const resultToAdd = {
            id: newResult.id || Date.now(),
            timestamp: newResult.timestamp || new Date().toISOString(),
            ...newResult
        };
        
        results.push(resultToAdd);
        
        // Write back to file
        if (writeResults(results)) {
            res.status(201).json(resultToAdd);
        } else {
            res.status(500).json({ error: 'Failed to save result' });
        }
    } catch (error) {
        console.error('Error saving result:', error);
        res.status(500).json({ error: 'Failed to save result' });
    }
});

// Delete result by ID
app.delete('/api/results/:id', (req, res) => {
    try {
        const { id } = req.params;
        const results = readResults();
        const initialLength = results.length;
        
        const filteredResults = results.filter(result => result.id != id);
        
        if (filteredResults.length === initialLength) {
            return res.status(404).json({ error: 'Result not found' });
        }
        
        if (writeResults(filteredResults)) {
            res.json({ message: 'Result deleted successfully' });
        } else {
            res.status(500).json({ error: 'Failed to delete result' });
        }
    } catch (error) {
        console.error('Error deleting result:', error);
        res.status(500).json({ error: 'Failed to delete result' });
    }
});

// Get statistics
app.get('/api/stats', (req, res) => {
    try {
        const results = readResults();
        
        const stats = {
            total: results.length,
            passed: results.filter(r => r.passed).length,
            failed: results.filter(r => !r.passed).length,
            byType: {
                sprawdzanie: results.filter(r => r.examType === 'sprawdzanie').length,
                ortografia: results.filter(r => r.examType === 'ortografia').length,
                dokumenty: results.filter(r => r.examType === 'dokumenty').length
            },
            passRate: results.length > 0 ? Math.round((results.filter(r => r.passed).length / results.length) * 100) : 0
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error generating stats:', error);
        res.status(500).json({ error: 'Failed to generate statistics' });
    }
});

// Authentication endpoint - with hashed passwords
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

// Verify token endpoint
app.post('/api/auth/verify', (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token || !token.startsWith('token_')) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        // Simple token validation (in production use JWT)
        const parts = token.split('_');
        if (parts.length === 3) {
            const userId = parseInt(parts[1]);
            const users = readUsers();
            const user = users.find(u => u.id === userId);
            
            if (user) {
                const { password: _, ...userWithoutPassword } = user;
                res.json({ valid: true, user: userWithoutPassword });
            } else {
                res.status(401).json({ error: 'Invalid token' });
            }
        } else {
            res.status(401).json({ error: 'Invalid token format' });
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(500).json({ error: 'Token verification failed' });
    }
});

// Get all users (superadmin only)
app.get('/api/users', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        
        console.log('GET /api/users - Token:', token);
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const parts = token.split('_');
        if (parts.length === 3) {
            const userId = parseInt(parts[1]);
            const users = readUsers();
            const user = users.find(u => u.id === userId);
            
            console.log('Token verification - User ID:', userId, 'Found user:', user?.username, 'Role:', user?.role);
            
            if (user && (user.role === 'superadmin' || user.role === 'administrator')) {
                const usersWithoutPasswords = users.map(({ password, ...user }) => user);
                console.log('Returning users:', usersWithoutPasswords.length);
                res.json(usersWithoutPasswords);
            } else {
                console.log('Access denied - not superadmin or administrator');
                res.status(403).json({ error: 'Access denied. Admin role required.' });
            }
        } else {
            console.log('Invalid token format');
            res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Create user (superadmin only) - with hashed passwords
app.post('/api/users', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const parts = token.split('_');
        if (parts.length === 3) {
            const userId = parseInt(parts[1]);
            const users = readUsers();
            const currentUser = users.find(u => u.id === userId);
            
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
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update user (superadmin only) - with hashed passwords
app.put('/api/users/:id', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const parts = token.split('_');
        if (parts.length === 3) {
            const userId = parseInt(parts[1]);
            const users = readUsers();
            const currentUser = users.find(u => u.id === userId);
            
            if (!currentUser || currentUser.role !== 'superadmin') {
                return res.status(403).json({ error: 'Access denied. Superadmin role required.' });
            }

            const targetUserId = parseInt(req.params.id);
            const { username, password, role, name } = req.body;
            
            const userIndex = users.findIndex(u => u.id === targetUserId);
            if (userIndex === -1) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (users[userIndex].role === 'superadmin' && targetUserId !== userId) {
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
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete user (superadmin only)
app.delete('/api/users/:id', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const parts = token.split('_');
        if (parts.length === 3) {
            const userId = parseInt(parts[1]);
            const users = readUsers();
            const currentUser = users.find(u => u.id === userId);
            
            if (!currentUser || currentUser.role !== 'superadmin') {
                return res.status(403).json({ error: 'Access denied. Superadmin role required.' });
            }

            const targetUserId = parseInt(req.params.id);
            
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
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Change password endpoint - fixed
app.post('/api/auth/change-password', (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const parts = token.split('_');
        if (parts.length === 3) {
            const userId = parseInt(parts[1]);
            const users = readUsers();
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex === -1) {
                return res.status(404).json({ error: 'User not found' });
            }

            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Current password and new password are required' });
            }

            const user = users[userIndex];
            const currentPasswordHash = hashPassword(currentPassword);
            
            if (user.password !== currentPasswordHash) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }

            users[userIndex].password = hashPassword(newPassword);
            if (writeUsers(users)) {
                res.json({ message: 'Password changed successfully' });
            } else {
                res.status(500).json({ error: 'Failed to update password' });
            }
        } else {
            res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString(), version: '1.0.0' });
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

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📊 API endpoints available at http://162.19.246.158:${PORT}/api/`);
    console.log(`💾 Data stored in: ${dataDir}`);
    console.log(`🔐 Passwords are hashed with SHA-256`);
    console.log(`👤 Test accounts: SzpakPL/admin123, administrator/admin123, CMD/admin123, użytkownik/admin123`);
});