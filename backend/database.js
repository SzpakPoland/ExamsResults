const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'data', 'exams.db');

// Hash password function
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

class Database {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Connected to SQLite database');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    async createTables() {
        const tables = [
            `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK (role IN ('superadmin', 'administrator', 'cmd', 'user')),
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                text TEXT NOT NULL,
                max_points INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
            
            `CREATE TABLE IF NOT EXISTS exam_results (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nick TEXT NOT NULL,
                date TEXT,
                attempt INTEGER,
                total_points INTEGER NOT NULL,
                max_points INTEGER NOT NULL,
                percentage REAL NOT NULL,
                passed BOOLEAN NOT NULL,
                exam_type TEXT NOT NULL CHECK (exam_type IN ('sprawdzanie', 'ortografia', 'dokumenty')),
                errors INTEGER,
                bonus_points INTEGER,
                notes TEXT,
                conductor_id INTEGER,
                conductor_name TEXT,
                question_results TEXT, -- JSON dla sprawdzanie
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (conductor_id) REFERENCES users(id)
            )`
        ];

        for (const sql of tables) {
            await this.run(sql);
        }

        await this.seedInitialData();
    }

    async seedInitialData() {
        // Check if users exist
        const userCount = await this.get("SELECT COUNT(*) as count FROM users");
        
        if (userCount.count === 0) {
            console.log('🌱 Seeding initial users...');
            const users = [
                {
                    username: 'superadmin',
                    password: hashPassword('superadmin123'),
                    role: 'superadmin',
                    name: 'Super Administrator'
                },
                {
                    username: 'admin',
                    password: hashPassword('admin123'),
                    role: 'administrator',
                    name: 'Administrator'
                },
                {
                    username: 'teacher',
                    password: hashPassword('teacher123'),
                    role: 'cmd',
                    name: 'Nauczyciel'
                },
                {
                    username: 'user',
                    password: hashPassword('user123'),
                    role: 'user',
                    name: 'Użytkownik'
                }
            ];

            for (const user of users) {
                await this.run(
                    "INSERT INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)",
                    [user.username, user.password, user.role, user.name]
                );
            }
        }

        // Check if questions exist
        const questionCount = await this.get("SELECT COUNT(*) as count FROM questions");
        
        if (questionCount.count === 0) {
            console.log('🌱 Seeding initial questions...');
            const questions = [
                {
                    text: "Jakie są podstawowe zasady bezpieczeństwa w sieci?",
                    maxPoints: 2
                },
                {
                    text: "Wymień trzy najważniejsze protokoły sieciowe.",
                    maxPoints: 3
                },
                {
                    text: "Co to jest firewall i jakie są jego funkcje?",
                    maxPoints: 3
                },
                {
                    text: "Opisz różnice między TCP a UDP.",
                    maxPoints: 4
                },
                {
                    text: "Jak działa system DNS?",
                    maxPoints: 3
                }
            ];

            for (const question of questions) {
                await this.run(
                    "INSERT INTO questions (text, max_points) VALUES (?, ?)",
                    [question.text, question.maxPoints]
                );
            }
        }
    }

    // Promisified database methods
    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Exam Results methods
    async getAllResults() {
        return await this.all(`
            SELECT er.*, u.name as conductor_full_name 
            FROM exam_results er 
            LEFT JOIN users u ON er.conductor_id = u.id 
            ORDER BY er.timestamp DESC
        `);
    }

    async getResultsByType(examType) {
        return await this.all(`
            SELECT er.*, u.name as conductor_full_name 
            FROM exam_results er 
            LEFT JOIN users u ON er.conductor_id = u.id 
            WHERE er.exam_type = ? 
            ORDER BY er.timestamp DESC
        `, [examType]);
    }

    async addResult(result) {
        const sql = `
            INSERT INTO exam_results (
                nick, date, attempt, total_points, max_points, percentage, 
                passed, exam_type, errors, bonus_points, notes, 
                conductor_id, conductor_name, question_results
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            result.nick,
            result.date || null,
            result.attempt || null,
            result.totalPoints,
            result.maxPoints,
            result.percentage,
            result.passed ? 1 : 0,
            result.examType,
            result.errors || null,
            result.bonusPoints || null,
            result.notes || null,
            result.conductorId || null,
            result.conductorName || null,
            result.questionResults ? JSON.stringify(result.questionResults) : null
        ];

        return await this.run(sql, params);
    }

    async deleteResult(id) {
        return await this.run("DELETE FROM exam_results WHERE id = ?", [id]);
    }

    async getStats() {
        const total = await this.get("SELECT COUNT(*) as count FROM exam_results");
        const passed = await this.get("SELECT COUNT(*) as count FROM exam_results WHERE passed = 1");
        const failed = await this.get("SELECT COUNT(*) as count FROM exam_results WHERE passed = 0");
        
        const byType = await this.all(`
            SELECT exam_type, COUNT(*) as count 
            FROM exam_results 
            GROUP BY exam_type
        `);

        const typeStats = {
            sprawdzanie: 0,
            ortografia: 0,
            dokumenty: 0
        };

        byType.forEach(row => {
            typeStats[row.exam_type] = row.count;
        });

        return {
            total: total.count,
            passed: passed.count,
            failed: failed.count,
            byType: typeStats,
            passRate: total.count > 0 ? Math.round((passed.count / total.count) * 100) : 0
        };
    }

    // Questions methods
    async getAllQuestions() {
        return await this.all("SELECT * FROM questions ORDER BY id");
    }

    // Users methods
    async getAllUsers() {
        return await this.all("SELECT id, username, role, name, created_at FROM users ORDER BY id");
    }

    async getUserByUsername(username) {
        return await this.get("SELECT * FROM users WHERE username = ?", [username]);
    }

    async getUserById(id) {
        return await this.get("SELECT id, username, role, name, created_at FROM users WHERE id = ?", [id]);
    }

    async addUser(userData) {
        const sql = "INSERT INTO users (username, password_hash, role, name) VALUES (?, ?, ?, ?)";
        return await this.run(sql, [
            userData.username,
            hashPassword(userData.password),
            userData.role,
            userData.name
        ]);
    }

    async updateUser(id, userData) {
        let sql = "UPDATE users SET username = ?, role = ?, name = ?";
        let params = [userData.username, userData.role, userData.name];
        
        if (userData.password) {
            sql += ", password_hash = ?";
            params.push(hashPassword(userData.password));
        }
        
        sql += " WHERE id = ?";
        params.push(id);
        
        return await this.run(sql, params);
    }

    async deleteUser(id) {
        return await this.run("DELETE FROM users WHERE id = ?", [id]);
    }

    async changePassword(id, newPassword) {
        return await this.run(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            [hashPassword(newPassword), id]
        );
    }

    close() {
        return new Promise((resolve) => {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('📴 Database connection closed');
                }
                resolve();
            });
        });
    }
}

module.exports = { Database, hashPassword };
