const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");

router.get("/", verifyToken, (req, res) => {
    res.json({ message: "Pagos protegidos" });
});


module.exports = router;