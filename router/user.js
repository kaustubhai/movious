const express = require("express");
const {
  register,
  getUser,
  login,
  getLocationTheaters,
} = require("../controllers/userController");
const router = express.Router();
const auth = require("../middleware/userAuth");

router.post("/register", register);
router.post("/login", login);
router.get("/get", auth, getUser);
router.get("/theaters", auth, getLocationTheaters);

module.exports = router;
