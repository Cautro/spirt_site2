const { Router } = require("express");
const { readDB, writeDB, findUserByLogin } = require("../services/database");
const bcrypt = require("bcrypt");

const router = Router();

// Получить всех пользователей
router.get("/", (_req, res) => {
    const db = readDB();
    res.json(
        db.users.map(({ password, ...user }) => user)
    );
});

// Получить пользователя по ID
router.get("/:id", (req, res) => {
    const { id } = req.params;
    const db = readDB();
    const user = db.users.find(u => u.id === parseInt(id));

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const { password, ...safeUser } = user;
    res.json(safeUser);
});

// Создать нового пользователя
router.post("/", (req, res) => {
    const { login, password, role, fullName, class: userClass } = req.body;

    if (!login || !password || !role || !fullName) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const validRoles = ["user", "helper", "admin", "secret-user"];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
    }

    const db = readDB();

    if (findUserByLogin(login)) {
        return res.status(409).json({ message: "User already exists" });
    }

    try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const newUser = {
            id: Math.max(...db.users.map(u => u.id), 0) + 1,
            login,
            password: hashedPassword,
            role,
            fullName,
            class: userClass || null,
            rating: 0,
            isOwner: false
        };

        db.users.push(newUser);
        writeDB(db);

        const { password: _, ...safeUser } = newUser;
        res.status(201).json(safeUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error creating user" });
    }
});

// Обновить рейтинг пользователя
router.patch("/:id/rating", (req, res) => {
    const { id } = req.params;
    const { rating } = req.body;

    if (typeof rating !== "number") {
        return res.status(400).json({ message: "Rating must be a number" });
    }

    // Валидация: рейтинг должен быть от 0 до 500
    if (rating < 0 || rating > 500) {
        return res.status(400).json({ message: "Rating must be between 0 and 500" });
    }

    const db = readDB();
    const user = db.users.find(u => u.id === parseInt(id));

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.rating = Math.max(0, Math.min(500, rating));
    writeDB(db);

    const { password, ...safeUser } = user;
    res.json(safeUser);
});

// Обновить пользователя (универсальный endpoint)
router.patch("/:id", (req, res) => {
    const { id } = req.params;
    const { rating, role, class: userClass, fullName } = req.body;

    const db = readDB();
    const user = db.users.find(u => u.id === parseInt(id));

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    if (rating !== undefined) {
        if (typeof rating !== "number" || rating < 0 || rating > 500) {
            return res.status(400).json({ message: "Rating must be between 0 and 500" });
        }
        user.rating = rating;
    }

    if (role !== undefined) {
        const validRoles = ["user", "admin", "helper", "secret-user"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }
        user.role = role;
    }

    if (userClass !== undefined) {
        user.class = userClass;
    }

    if (fullName !== undefined) {
        user.fullName = fullName;
    }

    writeDB(db);

    const { password, ...safeUser } = user;
    res.json(safeUser);
});

// Обновить роль пользователя
router.patch("/:id/role", (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["user", "admin", "helper", "secret-user"];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
    }

    const db = readDB();
    const user = db.users.find(u => u.id === parseInt(id));

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.role = role;
    writeDB(db);

    const { password, ...safeUser } = user;
    res.json(safeUser);
});

// Удалить пользователя
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const db = readDB();

    const userIndex = db.users.findIndex(u => u.id === parseInt(id));

    if (userIndex === -1) {
        return res.status(404).json({ message: "User not found" });
    }

    db.users.splice(userIndex, 1);
    writeDB(db);

    res.json({ message: "User deleted" });
});

module.exports = router;

