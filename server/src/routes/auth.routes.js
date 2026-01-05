const { Router } = require("express");
const { readDB, writeDB, findUserByLogin } = require("../services/database");
const { hashPassword, comparePassword } = require("../utils/hash");

const router = Router();

router.post("/register", (req, res) => {
    const { login, password, fullName, classNum } = req.body;

    if (!login || !password || !fullName || !classNum) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const db = readDB();

    if (db.users.some(u => u.login === login)) {
        return res.status(400).json({ message: "User already exists" });
    }

    const newUser = {
        id: Math.max(...db.users.map(u => u.id), 0) + 1,
        login,
        password: hashPassword(password),
        fullName,
        class: classNum,
        role: "user",
        rating: 0,
        isOwner: false
    };

    db.users.push(newUser);
    writeDB(db);

    const { password: _, ...safeUser } = newUser;
    return res.status(201).json({
        message: "User registered successfully",
        user: safeUser
    });
});

router.post("/login", (req, res) => {
    const { login, password } = req.body;

    if (!login || !password) {
        return res.status(400).json({ message: "Login and password required" });
    }

    const user = findUserByLogin(login);

    if (!user) {
        return res.status(401).json({ message: "Invalid login or password" });
    }

    const valid = comparePassword(password, user.password);

    if (!valid) {
        return res.status(401).json({ message: "Invalid login or password" });
    }

    const { password: _, ...safeUser } = user;

    return res.json({
        token: `fake-token-${user.id}`,
        user: safeUser
    });
});

module.exports = router;

