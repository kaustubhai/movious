const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../database/connect");

const register = async (req, res) => {
  try {
    const { name, age, contact, email, city, password } = req.body;
    if (!name || !age || !contact || !email || !city)
      throw Error("Every field is mandatory");
    if (!contact.match(/^(\+91[\-\s]?)\d{10}$/))
      throw Error("Invalid contact number");
    if (age < 12 || age > 150) throw Error("Please enter valid age");
    if (password.length < 8)
      throw Error("Password should be greater than 8 characters");
    if (
      !password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}/
      )
    )
      throw Error("Password is not strong engough");
    const userByMail = await pool.query(
      "SELECT name from person WHERE email = $1",
      [email]
    );
    if (userByMail.rows.length !== 0) throw Error("Email already in use");
    const userByContact = await pool.query(
      "SELECT name from person WHERE contact = $1",
      [contact]
    );
    if (userByContact.rows.length !== 0)
      throw Error("Contact number already in use");
    const hashed = await bcrypt.hash(password, 8);
    const result = await pool.query(
      "INSERT INTO person (name, age, email, contact, city, password) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, age, email, contact, city, hashed]
    );
    if (result.rows.length === 0) throw Error("Internal Server Error");
    const token = jwt.sign(
      { user: result.rows[0]._id.toString() },
      process.env.SECURITY_KEY,
      {
        expiresIn: 360000,
      }
    );
    res.cookie("token", token, { httpOnly: true });
    res.status(201).json({ ...result.rows[0], token });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw Error("All the fields are mandatory");
    const { rows } = await pool.query("SELECT * FROM person WHERE email = $1", [
      email,
    ]);
    if (rows.length === 0) throw Error("Email not registered");
    const passMatch = await bcrypt.compare(password, rows[0].password);
    if (!passMatch) throw Error("Password Mismatched");
    const token = jwt.sign(
      { user: rows[0]._id.toString() },
      process.env.SECURITY_KEY,
      {
        expiresIn: 360000,
      }
    );
    res.cookie("token", token, { httpOnly: true });
    res.json({ ...rows[0], token });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM person WHERE _id = $1", [
      req.user,
    ]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const getLocationTheaters = async (req, res) => {
  try {
    const user = await pool.query("SELECT city FROM person WHERE _id = $1", [
      req.user,
    ]);
    let city = user.rows[0].city;
    city = city.charAt(0).toUpperCase() + city.slice(1);
    const result = await pool.query(
      "SELECT * FROM theater WHERE address[3] ILIKE $1",
      [city]
    );
    if (result.rowCount === 0) throw Error("No Theater at your location");
    else res.json(result.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
};

module.exports = { register, login, getUser, getLocationTheaters };
