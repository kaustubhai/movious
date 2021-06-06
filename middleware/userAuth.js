const jwt = require("jsonwebtoken");
const pool = require("../database/connect");

module.exports = async function (req, res, next) {
  const token = req.header("x-auth-token") || req.cookies.token;

  if (!token) return res.status(401).json({ msg: "Unathorised Access" });
  try {
    const decoded = jwt.verify(token, process.env.SECURITY_KEY);
    const result = await pool.query("SELECT name from person WHERE _id = $1", [
      decoded.user,
    ]);
    if (result.rows.length === 0) throw Error("");
    req.user = decoded.user;
    next();
  } catch (e) {
    console.error("Token Error");
    res.status(500).json({ Error: "Token is not Valid" });
  }
};
