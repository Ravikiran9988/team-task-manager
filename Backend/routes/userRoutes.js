const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { getUsers } = require("../controllers/userController");

const router = express.Router();

router.get("/", authMiddleware, roleMiddleware("admin"), getUsers);

module.exports = router;

