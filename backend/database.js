const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'data', 'results.db');

class ResultsDatabase {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    console.error('Error opening results database:', err.message);
                    reject(err);
                } else {
                    console.log('✅ Connected to Results SQLite database');
                    this.createResultsTable().then(resolve).catch(reject);
                }
            });
        });
    }

    async createResultsTable() {
        const sql = `
            CREATE TABLE IF NOT EXISTS exam_results (
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
                conductor_id TEXT,
                conductor_name TEXT,
                question_results TEXT, -- JSON dla sprawdzanie
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;
        
        await this.run(sql);
        console.log('📊 Results table created/verified');
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

    // Results methods
    async getAllResults() {
        return await this.all(`
            SELECT * FROM exam_results 
            ORDER BY timestamp DESC
        `);
    }

    async getResultsByType(examType) {
        return await this.all(`
            SELECT * FROM exam_results 
            WHERE exam_type = ? 
            ORDER BY timestamp DESC
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

    close() {
        return new Promise((resolve) => {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing results database:', err.message);
                } else {
                    console.log('📴 Results database connection closed');
                }
                resolve();
            });
        });
    }
}

module.exports = { ResultsDatabase };
