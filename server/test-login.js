const { comparePassword } = require('./src/utils/hash');
const { findUserByLogin } = require('./src/services/database');

// Тест хеша
const hash = '$2b$10$BVhqk3a6QSFjBfHIkBb2HOA4pfNOssFTvGoL1oYHFpa9bTsgKt3KW';
console.log('1. Тест comparePassword:');
console.log('   password123 vs hash:', comparePassword('password123', hash));
console.log('   wrongpass vs hash:', comparePassword('wrongpass', hash));

// Тест поиска пользователя
console.log('\n2. Тест findUserByLogin:');
const user = findUserByLogin('admin1');
console.log('   Found user:', user ? user.login : 'NOT FOUND');
console.log('   User hash:', user ? user.password : 'N/A');

// Тест сравнения пароля пользователя
if (user) {
    console.log('\n3. Тест login admin1 с password123:');
    const valid = comparePassword('password123', user.password);
    console.log('   Valid:', valid);
}

