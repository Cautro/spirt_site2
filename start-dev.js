#!/usr/bin/env node

// Start server
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Запуск сервера...');

const serverProcess = spawn('node', ['src/index.js'], {
    cwd: path.join(__dirname, 'server'),
    stdio: 'inherit'
});

serverProcess.on('error', (err) => {
    console.error('Ошибка сервера:', err);
});

// Give server time to start
setTimeout(() => {
    console.log('\n✅ Сервер должен быть запущен');
    console.log('🧪 Открыте http://localhost:3000/health в браузере');
    console.log('📱 Открыте http://localhost:5173 для фронтенда');
}, 2000);

