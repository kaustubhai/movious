const express = require("express");
const {
  register,
  getUser,
  login,
  getLocationTheaters,
  bookShow,
  getBooking,
  payment,
} = require("../controllers/userController");
const router = express.Router();
const auth = require("../middleware/userAuth");

router.post("/register", register);
router.post("/login", login);
router.get("/get", auth, getUser);
router.get("/theaters", auth, getLocationTheaters);
router.post("/book/:show", auth, bookShow);
router.get("/ticket/:id", auth, getBooking);
router.post("/payment/:token/:id", auth, payment);

module.exports = router;
