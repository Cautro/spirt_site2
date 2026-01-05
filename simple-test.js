const http = require('http');

const req = http.get('http://localhost:3000/health', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('Health:', res.statusCode, data);
        process.exit(0);
    });
});

req.on('error', (err) => {
    console.error('Error:', err.message);
    process.exit(1);
});

setTimeout(() => {
    console.error('Timeout');
    process.exit(1);
}, 5000);

