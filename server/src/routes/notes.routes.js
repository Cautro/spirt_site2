const { Router } = require("express");
const { readDB, writeDB } = require("../services/database");

const router = Router();

// Получить все заметки
router.get("/", (_req, res) => {
    const db = readDB();
    res.json(db.notes || []);
});

// Получить заметки пользователя
router.get("/user/:userId", (req, res) => {
    const { userId } = req.params;
    const db = readDB();
    const notes = (db.notes || []).filter(n => n.userId === parseInt(userId));
    res.json(notes);
});

// Создать заметку
router.post("/", (req, res) => {
    const { title, content, userId, targetId } = req.body;

    if (!title || !content || !userId) {
        return res.status(400).json({ message: "Title, content, and userId are required" });
    }

    const db = readDB();

    if (!db.notes) {
        db.notes = [];
    }

    const newNote = {
        id: Math.max(...(db.notes?.map(n => n.id) || [0]), 0) + 1,
        title,
        content,
        userId,
        targetId: targetId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    db.notes.push(newNote);
    writeDB(db);

    res.status(201).json(newNote);
});

// Обновить заметку
router.patch("/:id", (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    const db = readDB();
    if (!db.notes) {
        db.notes = [];
    }

    const note = db.notes.find(n => n.id === parseInt(id));

    if (!note) {
        return res.status(404).json({ message: "Note not found" });
    }

    if (title) note.title = title;
    if (content) note.content = content;
    note.updatedAt = new Date().toISOString();

    writeDB(db);

    res.json(note);
});

// Удалить заметку
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const db = readDB();

    if (!db.notes) {
        db.notes = [];
    }

    const index = db.notes.findIndex(n => n.id === parseInt(id));

    if (index === -1) {
        return res.status(404).json({ message: "Note not found" });
    }

    db.notes.splice(index, 1);
    writeDB(db);

    res.json({ message: "Note deleted" });
});

module.exports = router;

