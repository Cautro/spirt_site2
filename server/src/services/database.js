const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../../data/database.json");

function readDB() {
    const raw = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(raw);
}

function writeDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function findUserByLogin(login) {
    const db = readDB();
    return db.users.find(u => u.login === login) || null;
}

module.exports = { readDB, writeDB, findUserByLogin };
