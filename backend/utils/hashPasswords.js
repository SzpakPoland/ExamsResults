const crypto = require('crypto');

// Utility to hash passwords
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Get password from command line argument
const password = process.argv[2];

if (!password) {
    console.log('❌ Brak hasła!');
    console.log('');
    console.log('Użycie:');
    console.log('  node utils/hashPasswords.js [hasło]');
    console.log('');
    console.log('Przykład:');
    console.log('  node utils/hashPasswords.js mojehaslo123');
    console.log('');
    console.log('Istniejące hashe:');
    console.log('  admin123    → 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918');
    console.log('  teacher123  → ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f');
    console.log('  user123     → 04f8996da763b7a969b1028ee3007569eaf3a635486ddab211d512c85b9df8fb');
} else {
    const hash = hashPassword(password);
    console.log(`✅ Hash dla hasła "${password}":`);
    console.log(`   ${hash}`);
    console.log('');
    console.log('📋 Skopiuj powyższy hash do pliku users.json');
}

module.exports = { hashPassword };
