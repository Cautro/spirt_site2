const { hashPassword } = require("../src/utils/hash");

const pass = process.argv[2];

if (!pass) {
    console.error("Usage: node hash.js <password>");
    process.exit(1);
}

console.log(hashPassword(pass));
