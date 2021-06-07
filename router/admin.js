const express = require("express");
const multer = require("../middleware/multer");
const {
  register,
  getUser,
  login,
  theaterDetailsUpdate,
  addShow,
  editShow,
} = require("../controllers/adminController");
const router = express.Router();
const auth = require("../middleware/adminAuth");

router.post("/register", register);
router.post("/login", login);
router.get("/get", auth, getUser);
router.patch("/update", auth, theaterDetailsUpdate);
router.post("/set", auth, multer.single("poster"), addShow);
router.patch("/edit/:id", auth, multer.single("poster"), editShow);

module.exports = router;
