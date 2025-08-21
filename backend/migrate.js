const fs = require('fs');
const path = require('path');
const { Database } = require('./database');

async function migrateData() {
    console.log('🔄 Starting data migration from JSON to SQLite...');
    
    const db = new Database();
    await db.init();
    
    const dataDir = path.join(__dirname, 'data');
    
    try {
        // Migrate results if JSON file exists
        const resultsJsonPath = path.join(dataDir, 'results.json');
        if (fs.existsSync(resultsJsonPath)) {
            console.log('📄 Found results.json, migrating...');
            
            const resultsData = JSON.parse(fs.readFileSync(resultsJsonPath, 'utf8'));
            
            for (const result of resultsData) {
                try {
                    await db.addResult({
                        nick: result.nick,
                        date: result.date,
                        attempt: result.attempt,
                        totalPoints: result.totalPoints,
                        maxPoints: result.maxPoints,
                        percentage: result.percentage,
                        passed: result.passed,
                        examType: result.examType,
                        errors: result.errors,
                        bonusPoints: result.bonusPoints,
                        notes: result.notes,
                        conductorName: result.conductorName,
                        conductorId: result.conductorId,
                        questionResults: result.questionResults
                    });
                    console.log(`✅ Migrated result for: ${result.nick}`);
                } catch (err) {
                    console.error(`❌ Failed to migrate result for ${result.nick}:`, err.message);
                }
            }
            
            // Backup original JSON file
            const backupPath = path.join(dataDir, `results_backup_${Date.now()}.json`);
            fs.renameSync(resultsJsonPath, backupPath);
            console.log(`📦 Backed up original results.json to: ${backupPath}`);
        }
        
        console.log('✅ Migration completed successfully!');
        
        // Show statistics
        const stats = await db.getStats();
        console.log('📊 Database statistics:');
        console.log(`   Total results: ${stats.total}`);
        console.log(`   Passed: ${stats.passed}`);
        console.log(`   Failed: ${stats.failed}`);
        console.log(`   Pass rate: ${stats.passRate}%`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await db.close();
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrateData();
}

module.exports = { migrateData };
