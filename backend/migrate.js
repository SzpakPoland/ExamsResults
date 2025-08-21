const fs = require('fs');
const path = require('path');
const { ResultsDatabase } = require('./database');

async function migrateResults() {
    console.log('🔄 Starting results migration from JSON to SQLite...');
    
    const resultsDb = new ResultsDatabase();
    await resultsDb.init();
    
    const dataDir = path.join(__dirname, 'data');
    const resultsJsonPath = path.join(dataDir, 'results.json');
    
    try {
        if (fs.existsSync(resultsJsonPath)) {
            console.log('📄 Found results.json, migrating...');
            
            const resultsData = JSON.parse(fs.readFileSync(resultsJsonPath, 'utf8'));
            let migratedCount = 0;
            
            for (const result of resultsData) {
                try {
                    await resultsDb.addResult({
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
                    migratedCount++;
                    console.log(`✅ Migrated result ${migratedCount}: ${result.nick} (${result.examType})`);
                } catch (err) {
                    console.error(`❌ Failed to migrate result for ${result.nick}:`, err.message);
                }
            }
            
            // Backup original JSON file
            const backupPath = path.join(dataDir, `results_backup_${Date.now()}.json`);
            fs.renameSync(resultsJsonPath, backupPath);
            console.log(`📦 Backed up original results.json to: ${backupPath}`);
            console.log(`✅ Migration completed! Migrated ${migratedCount}/${resultsData.length} results.`);
        } else {
            console.log('📄 No results.json found - starting with fresh SQLite database');
        }
        
        // Show statistics
        const stats = await resultsDb.getStats();
        console.log('📊 Database statistics:');
        console.log(`   Total results: ${stats.total}`);
        console.log(`   Passed: ${stats.passed}`);
        console.log(`   Failed: ${stats.failed}`);
        console.log(`   Pass rate: ${stats.passRate}%`);
        console.log(`   By type: sprawdzanie=${stats.byType.sprawdzanie}, ortografia=${stats.byType.ortografia}, dokumenty=${stats.byType.dokumenty}`);
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await resultsDb.close();
    }
}

// Run migration if this file is executed directly
if (require.main === module) {
    migrateResults();
}

module.exports = { migrateResults };
