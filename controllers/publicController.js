const pool = require("../database/connect");

const getShows = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM show");
    if (result.rowCount === 0) throw Error("No show fonded");
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
};

const getTheaters = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM theater");
    if (result.rowCount === 0) throw Error("No theaters founded");
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
};

module.exports = { getShows, getTheaters };
