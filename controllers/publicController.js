const pool = require("../database/connect");

const getShows = async (req, res) => {
  try {
    const result = await pool.query("SELECT _id, name, poster, age, language FROM show");
    if (result.rowCount === 0) throw Error("No show fonded");
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
};

const getShow = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query("SELECT * FROM show WHERE _id = $1", [id]);
    if (result.rowCount === 0) throw Error("No show fonded");
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
};

const getShowInTheater = async (req, res) => {
  try {
    const { theater } = req.params
    const result = await pool.query("SELECT _id, name, poster, age, language FROM show WHERE theater = $1", [theater])
    if(result.rowCount === 0)
      throw Error("There is no show right now")
    res.json(result.rows[0])
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
}

const getTheaters = async (req, res) => {
  try {
    const result = await pool.query("SELECT _id, name, address[2] FROM theater");
    if (result.rowCount === 0) throw Error("No theaters founded");
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
};

const getTheater = async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query("SELECT * FROM theater WHERE _id = $1", [id]);
    if (result.rowCount === 0) throw Error("No theaters founded");
    res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
};

module.exports = { getShows, getShow, getTheaters, getTheater, getShowInTheater };
