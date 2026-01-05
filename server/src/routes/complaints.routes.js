const { Router } = require("express");
const { readDB, writeDB } = require("../services/database");

const router = Router();

// Получить все жалобы
router.get("/", (_req, res) => {
    const db = readDB();
    res.json(db.complaints || []);
});

// Создать жалобу
router.post("/", (req, res) => {
    const { title, description, userId } = req.body;

    if (!title || !description || !userId) {
        return res.status(400).json({ message: "Title, description, and userId are required" });
    }

    const db = readDB();

    if (!db.complaints) {
        db.complaints = [];
    }

    const newComplaint = {
        id: Math.max(...(db.complaints?.map(c => c.id) || [0]), 0) + 1,
        title,
        description,
        userId,
        status: "open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    db.complaints.push(newComplaint);
    writeDB(db);

    res.status(201).json(newComplaint);
});

// Обновить статус жалобы
router.patch("/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    const db = readDB();
    if (!db.complaints) {
        db.complaints = [];
    }

    const complaint = db.complaints.find(c => c.id === parseInt(id));

    if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = status;
    complaint.updatedAt = new Date().toISOString();
    writeDB(db);

    res.json(complaint);
});

// Удалить жалобу
router.delete("/:id", (req, res) => {
    const { id } = req.params;
    const db = readDB();

    if (!db.complaints) {
        db.complaints = [];
    }

    const index = db.complaints.findIndex(c => c.id === parseInt(id));

    if (index === -1) {
        return res.status(404).json({ message: "Complaint not found" });
    }

    db.complaints.splice(index, 1);
    writeDB(db);

    res.json({ message: "Complaint deleted" });
});

module.exports = router;

