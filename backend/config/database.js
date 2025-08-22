const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db = null;

const getDb = () => {
  if (!db) {
    // Użyj results.db (jak w folderze data)
    db = new sqlite3.Database(path.join(__dirname, '../data/results.db'), (err) => {
      if (err) {
        console.error('❌ Error opening database:', err.message);
      } else {
        console.log('✅ Connected to Results SQLite database (results.db)');
        initializeDatabase();
      }
    });
  }
  return db;
};

const closeDb = () => {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      }
    });
    db = null;
  }
};

// Inicjalizacja tabeli (bez errors_list)
const initializeDatabase = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS exam_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nick TEXT NOT NULL,
      date TEXT,
      attempt INTEGER,
      total_points INTEGER NOT NULL,
      max_points INTEGER NOT NULL,
      percentage REAL NOT NULL,
      passed INTEGER NOT NULL,
      timestamp TEXT NOT NULL,
      exam_type TEXT NOT NULL,
      errors INTEGER,
      bonus_points INTEGER,
      notes TEXT,
      conductor_name TEXT,
      conductor_id TEXT,
      question_results TEXT
    )
  `;

  db.run(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    } else {
      console.log('📊 Results table created/verified');
    }
  });
};

// Wrapper dla async/await z sqlite3
const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

const getAllAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const database = getDb();
    database.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

module.exports = {
  getDb,
  closeDb,
  runAsync,
  getAllAsync,
  getAsync
};