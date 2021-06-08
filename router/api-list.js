const express = require("express");
const {
  getCities,
  getLanguages,
  getLanguagesInLocation,
  getTheaters,
  getTheatersInLocation,
} = require("../controllers/aliListController");
const router = express.Router();

router.get("/locations", getCities);
router.get("/languages", getLanguages);
router.get("/languages/:location", getLanguagesInLocation);
router.get("/theaters", getTheaters);
router.get("/theaters/:location", getTheatersInLocation);

module.exports = router;
