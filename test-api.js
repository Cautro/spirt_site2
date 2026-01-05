#!/usr/bin/env node

const http = require('http');

function testEndpoint(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    data: data
                });
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTests() {
    console.log('🧪 Тестирование API...\n');

    try {
        // Test health
        console.log('1️⃣  Health Check:');
        let result = await testEndpoint('GET', '/health');
        console.log(`   Status: ${result.status}`);
        console.log(`   Response: ${result.data}\n`);

        // Test login
        console.log('2️⃣  Login (admin):');
        result = await testEndpoint('POST', '/auth/login', {
            login: 'admin',
            password: 'password'
        });
        console.log(`   Status: ${result.status}`);
        console.log(`   Response: ${result.data}\n`);

        // Test users list
        console.log('3️⃣  Get Users:');
        result = await testEndpoint('GET', '/api/users');
        console.log(`   Status: ${result.status}`);
        const users = JSON.parse(result.data);
        console.log(`   Found ${users.length} users`);
        console.log(`   Response: ${result.data}\n`);

        console.log('✅ All tests completed!');
    } catch (err) {
        console.error('❌ Test failed:', err.message);
    }
}

runTests();

