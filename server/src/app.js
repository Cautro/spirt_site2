const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");
const usersRoutes = require("./routes/users.routes");
const complaintsRoutes = require("./routes/complaints.routes");
const notesRoutes = require("./routes/notes.routes");

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/complaints", complaintsRoutes);
app.use("/api/notes", notesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
