const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { readDB, writeDB, findUserByLogin } = require("../services/database");
const { hashPassword, comparePassword } = require("../utils/hash");

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key";
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

    const token = jwt.sign(
        { id: user.id, login: user.login, role: user.role },
        SECRET_KEY,
        { expiresIn: "7d" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
        token,
        user: safeUser
    });
});

router.get("/me", (req, res) => {
    const token = req.cookies?.token || (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]);

    if (!token) {
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = findUserByLogin(decoded.login);

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const { password: _, ...safeUser } = user;
        return res.json({ user: safeUser });
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("token");
    return res.json({ message: "Logged out" });
});

module.exports = router;

