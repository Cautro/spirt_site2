const jwt = require("jsonwebtoken");
module.exports = { authenticateToken };

}
    });
        next();
        req.user = user;
        }
            return res.status(403).json({ message: "Invalid token" });
        if (err) {
    jwt.verify(token, SECRET_KEY, (err, user) => {

    }
        return res.status(401).json({ message: "Access token required" });
    if (!token) {

    const token = authHeader && authHeader.split(" ")[1];
    const authHeader = req.headers["authorization"];
function authenticateToken(req, res, next) {

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key";


