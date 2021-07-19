const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../database/connect");
const sharp = require("sharp");

const register = async (req, res) => {
  try {
    const { name, admin, contact, email, address, password } = req.body;
    if (!name || !admin || !contact || !email)
      throw Error("Every field is mandatory");
    if (!address || address.length !== 3)
      throw Error("Address need to have 3 lines atleast");
    if (!contact.match(/^(\+91[\-\s]?)\d{10}$/))
      throw Error("Invalid contact number");
    if (password.length < 8)
      throw Error("Password should be greater than 8 characters");
    if (
      !password.match(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}/
      )
    )
      throw Error("Password is not strong engough");
    const userByMail = await pool.query(
      "SELECT name from theater WHERE email = $1",
      [email]
    );
    if (userByMail.rows.length !== 0) throw Error("Email already in use");
    const userByContact = await pool.query(
      "SELECT name from theater WHERE contact = $1",
      [contact]
    );
    if (userByContact.rows.length !== 0)
      throw Error("Contact number already in use");
    const hashed = await bcrypt.hash(password, 8);
    const addressFixed = address.map(
      (add) => add.charAt(0).toUpperCase() + add.slice(1)
    );
    const result = await pool.query(
      "INSERT INTO theater (name, admin, contact, email, address, password) VALUES($1, $2, $3, $4, $5, $6) RETURNING _id, name, admin, contact, email, address",
      [name, admin, contact, email, addressFixed, hashed]
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
    const { rows } = await pool.query(
      "SELECT _id, name, admin, contact, email, address, password FROM theater WHERE email = $1",
      [email]
    );
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
    const { rows } = await pool.query("SELECT _id, name, admin, contact, email, address, password FROM theater WHERE _id = $1", [
      req.user,
    ]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const theaterDetailsUpdate = async (req, res) => {
  try {
    const { name, email, contact, address } = req.body;
    if (name)
      await pool.query("UPDATE theater SET name = $1 WHERE _id = $2", [
        name,
        req.user,
      ]);
    if (email) {
      const userByMail = await pool.query(
        "SELECT name from theater WHERE email = $1",
        [email]
      );
      if (userByMail.rows.length !== 0) throw Error("Email already in use");
      await pool.query("UPDATE theater SET email = $1 WHERE _id = $2", [
        email,
        req.user,
      ]);
    }
    if (contact) {
      if (!contact.match(/^(\+91[\-\s]?)\d{10}$/))
        throw Error("Invalid contact number");
      const userByContact = await pool.query(
        "SELECT name from theater WHERE contact = $1",
        [contact]
      );
      if (userByContact.rows.length !== 0)
        throw Error("Contact number already in use");
      await pool.query("UPDATE theater SET contact = $1 WHERE _id = $2", [
        contact,
        req.user,
      ]);
    }
    if (address) {
      if (!address || address.length !== 3)
        throw Error("Address need to have 3 lines atleast");
      const addressFixed = address.map(
        (add) => add.charAt(0).toUpperCase() + add.slice(1)
      );
      await pool.query("UPDATE theater SET address = $1 WHERE _id = $2", [
        addressFixed,
        req.user,
      ]);
    }
    if (!name && !email && !contact && !address)
      throw Error("Atleast one field is necessary");
    const finalUser = await pool.query("SELECT _id, name, admin, contact, email, address, password FROM theater WHERE _id = $1", [
      req.user,
    ]);
    res.json(finalUser.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const addShow = async (req, res) => {
  try {
    const buffer = req.file.buffer;
    const { screen, seats, cost, language, age, time, name, duration } = req.body;
    if (
      !name ||
      !screen ||
      !seats ||
      !cost ||
      !buffer ||
      !language ||
      !age ||
      !duration ||
      !time
    )
      throw Error("All fields are mandatory");
    const poster = await sharp(buffer).resize(500, 500).webp().toBuffer();
    if (time < Date.now() / 1000) throw Error("Enter valid age");
    if (JSON.parse(seats).length !== 2) throw Error("Enter seats in correct format");
    if (`${duration.trim().split('.')[0]}`.length !== 4) throw Error("Enter duration in correct format");
    const theater = req.user;
    const result = await pool.query(
      "INSERT INTO show (poster, theater, screen, date, seats, cost, duration, language, age, name) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
      [
        poster,
        theater,
        screen,
        time,
        JSON.parse(seats),
        cost,
        duration,
        language.toLowerCase(),
        age,
        name,
      ]
    );
    if (result.rowCount === 0) throw Error("Internal Server Error");
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const editShow = async (req, res) => {
  try {
    const buffer = req.file?.buffer;
    const { id } = req.params;
    const { screen, seats, cost, language, age, time, name } = req.body;
    if (buffer) {
      const poster = await sharp(buffer).resize(500, 500).webp().toBuffer();
      await pool.query("UPDATE show SET poster = $1 WHERE _id = $2", [
        poster,
        id,
      ]);
    }
    if (name)
      await pool.query("UPDATE show SET name = $1 WHERE _id = $2", [name, id]);
    if (time)
      await pool.query("UPDATE show SET date = $1 WHERE _id = $2", [time, id]);
    if (age)
      await pool.query("UPDATE show SET age = $1 WHERE _id = $2", [age, id]);
    if (language)
      await pool.query("UPDATE show SET language = $1 WHERE _id = $2", [
        language.toLowerCase(),
        id,
      ]);
    if (cost)
      await pool.query("UPDATE show SET cost = $1 WHERE _id = $2", [cost, id]);
    if (seats)
      await pool.query("UPDATE show SET seats = $1 WHERE _id = $2", [
        seats,
        id,
      ]);
    if (screen)
      await pool.query("UPDATE show SET screen = $1 WHERE _id = $2", [
        screen,
        id,
      ]);
    const result = await pool.query("SELECT * FROM show where _id = $1", [id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  register,
  login,
  getUser,
  theaterDetailsUpdate,
  addShow,
  editShow,
};
