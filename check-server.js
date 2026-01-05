#!/usr/bin/env node

const http = require('http');

http.get('http://localhost:3000/health', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('✅ Server is working!');
        console.log('Response:', data);
        process.exit(0);
    });
}).on('error', (err) => {
    console.log('❌ Server is not responding:', err.message);
    process.exit(1);
});

setTimeout(() => {
    console.log('❌ Timeout - server not responding');
    process.exit(1);
}, 5000);

