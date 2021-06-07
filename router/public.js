const express = require("express");
const {
  getTheaters,
  getLocationTheaters,
} = require("../controllers/publicController");
const router = express.Router();

router.get("/", getTheaters);
router.get("/:location", getLocationTheaters);

module.exports = router;
