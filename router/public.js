const express = require("express");
const { getTheaters, getShows, getTheater, getShow, getShowInTheater } = require("../controllers/publicController");
const router = express.Router();

router.get("/shows", getShows);
router.get("/shows/:id", getShow);
router.get("/shows/:theater", getShowInTheater);
router.get("/theaters", getTheaters);
router.get("/theaters/:id", getTheater);

module.exports = router;
