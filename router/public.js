const express = require("express");
const { getTheaters, getShows } = require("../controllers/publicController");
const router = express.Router();

router.get("/shows", getShows);
router.get("/theaters", getTheaters);

module.exports = router;
