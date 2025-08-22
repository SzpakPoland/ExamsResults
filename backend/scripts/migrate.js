const { runAsync, getAllAsync } = require('../config/database');
const initializeDatabase = require('./init-database');

async function runMigration() {
  try {
    console.log('🔄 Uruchamianie migracji...');
    
    // Najpierw zainicjalizuj bazę danych (stworzy tabelę jeśli nie istnieje)
    await initializeDatabase();
    
    console.log('✅ Migracja zakończona pomyślnie!');
    
  } catch (error) {
    console.error('❌ Błąd podczas migracji:', error);
    throw error;
  }
}

// Uruchom migrację jeśli plik jest wywołany bezpośrednio
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('✅ Wszystkie migracje zakończone');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Migracja nieudana:', error);
      process.exit(1);
    });
}

module.exports = runMigration;