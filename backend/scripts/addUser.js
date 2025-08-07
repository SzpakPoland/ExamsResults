const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Get arguments from command line
const [username, password, role, name] = process.argv.slice(2);

if (!username || !password || !role || !name) {
    console.log('❌ Brak wymaganych parametrów!');
    console.log('');
    console.log('Użycie:');
    console.log('  node scripts/addUser.js [username] [password] [role] [name]');
    console.log('');
    console.log('Przykład:');
    console.log('  node scripts/addUser.js testuser mypassword123 user "Test User"');
    console.log('');
    console.log('Role: admin, teacher, user');
    process.exit(1);
}

try {
    const usersFile = path.join(__dirname, '..', 'data', 'users.json');
    const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    
    // Check if username already exists
    if (users.find(u => u.username === username)) {
        console.log(`❌ Użytkownik "${username}" już istnieje!`);
        process.exit(1);
    }
    
    // Get next ID
    const nextId = Math.max(...users.map(u => u.id)) + 1;
    
    // Create new user
    const newUser = {
        id: nextId,
        username,
        password: hashPassword(password),
        role,
        name
    };
    
    // Add to users array
    users.push(newUser);
    
    // Save back to file
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    
    console.log('✅ Użytkownik dodany pomyślnie!');
    console.log('');
    console.log('📊 Szczegóły:');
    console.log(`   ID: ${nextId}`);
    console.log(`   Username: ${username}`);
    console.log(`   Role: ${role}`);
    console.log(`   Name: ${name}`);
    console.log(`   Password Hash: ${newUser.password}`);
    
} catch (error) {
    console.error('❌ Błąd podczas dodawania użytkownika:', error.message);
    process.exit(1);
}
