const pool = require("../database/connect");

const getCities = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT DISTINCT(address[3]) FROM show LEFT JOIN theater on show.theater = theater._id"
    );
    if (result.rowCount === 0) throw Error("No City Founded");
    const cities = result.rows.map((address) => address.address);
    res.json(cities);
  } catch (error) {
    res.json({ error: error.message });
    console.error(error);
  }
};
const getLanguages = async (req, res) => {
  try {
    const result = await pool.query("SELECT DISTINCT(language) FROM show;");
    if (result.rowCount === 0) throw Error("No City Founded");
    const languages = result.rows.map((language) => language.language);
    res.json(languages);
  } catch (error) {
    res.json({ error: error.message });
    console.error(error);
  }
};
const getLanguagesInLocation = async (req, res) => {
  try {
    let { location } = req.params;
    location = location.charAt(0).toUpperCase() + location.slice(1);
    const result = await pool.query(
      "select language, address FROM show LEFT JOIN theater on show.theater = theater._id WHERE theater.address[3] = $1",
      [location]
    );
    const cities = result.rows.map((address) => address.address);
    res.json(cities);
  } catch (error) {
    res.json({ error: error.message });
    console.error(error);
  }
};
const getTheaters = async (req, res) => {
  try {
    const result = await pool.query("select * FROM theater");
    res.json(result.rows);
  } catch (error) {
    res.json({ error: error.message });
    console.error(error);
  }
};
const getTheatersInLocation = async (req, res) => {
  try {
    let { location } = req.params;
    location = location.charAt(0).toUpperCase() + location.slice(1);
    const result = await pool.query(
      "select * FROM theater WHERE address[3] = $1",
      [location]
    );
    res.json(result.rows);
  } catch (error) {
    res.json({ error: error.message });
    console.error(error);
  }
};

module.exports = {
  getCities,
  getLanguages,
  getLanguagesInLocation,
  getTheaters,
  getTheatersInLocation,
};
