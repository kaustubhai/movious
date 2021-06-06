const express = require("express");
const { register, getUser, login } = require("../controllers/adminController");
const router = express.Router();
const auth = require("../middleware/adminAuth");

router.post("/register", register);
router.post("/login", login);
router.get("/get", auth, getUser);

module.exports = router;
