const pool = require("../database/connect");

const getTheaters = async (req, res) => {
  const result = await pool.query("SELECT * FROM theater");
  res.json(result.rows);
};

const getLocationTheaters = async (req, res) => {
  try {
    const { location } = req.params;
    const result = await pool.query(
      "SELECT * FROM theater WHERE address[3] ILIKE $1",
      [location]
    );
    if (result.rowCount === 0) throw Error("No Theater at your location");
    else res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
};

module.exports = { getTheaters, getLocationTheaters };
