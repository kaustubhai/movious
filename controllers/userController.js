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
      "INSERT INTO person (name, age, email, contact, city, password) VALUES($1, $2, $3, $4, $5, $6) RETURNING _id, name, age, email, contact, city",
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
    const { rows } = await pool.query("SELECT _id, name, age, email, contact, city FROM person WHERE email = $1", [
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
    const { rows } = await pool.query("SELECT _id, name, age, email, contact, city FROM person WHERE _id = $1", [
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

const bookShow = async (req, res) => {
  try {
    const { show } = req.params
    let { seats } = req.body
    if(!seats || seats.length === 0)
      throw Error("Please select seats")
    const { rows } = await pool.query("SELECT * FROM show WHERE _id = $1", [show])
    let availableSeats
    if(rows[0].booked)
      availableSeats = (rows[0].seats[0] * rows[0].seats[1]) - rows[0].booked.length
    else
    availableSeats = (rows[0].seats[0] * rows[0].seats[1])
    if(availableSeats < seats.length)
      throw Error("Not enough seats available")
    seats.forEach(seat => {
      if(seat + 1 > rows[0].seats[0] * rows[0].seats[1])
        throw Error("Please select proper seats")
      if(rows[0].booked && rows[0].booked.indexOf(seat) !== -1)
        throw Error("THese seats are already booked")
    })
    let seatUpdate
    if(rows[0].booked)
      seatUpdate = [...rows[0].booked, ...seats]
      else
      seatUpdate = seats
    await pool.query("UPDATE show SET booked = $1 WHERE _id = $2", [
      seatUpdate, show
    ])
    const transaction = rows[0].cost * seats.length
    console.log(seats)
    const book = await pool.query("INSERT INTO booking(person, show, transaction, seats) VALUES($1, $2, $3, $4) RETURNING *", [
      req.user, show, transaction, seats
    ])
    const user = await pool.query("SELECT * FROM person WHERE _id =  $1", [req.user])
    let bookedShow
    if(user.rows[0].booked)
      bookedShow = [...user.rows[0].booked, book.rows[0]._id]
      else
      bookedShow = [book.rows[0]._id]
    await pool.query("UPDATE person SET booked = $1 WHERE _id = $2", [
      bookedShow, req.user
    ])
    res.json(book.rows[0])
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
}

const getBooking = async (req, res) => {
  try {
    const { id } = req.params
    console.log(id)
    const booking = await pool.query("SELECT email FROM booking LEFT JOIN person ON person._id = booking.person WHERE booking._id = $1", [id])
    const user = await pool.query("SELECT * FROM person WHERE _id = $1", [req.user])
    if(user.rows[0].email !== booking.rows[0].email)
      throw Error("Unauthorized access")
    const booking2 = await pool.query("SELECT * FROM booking LEFT JOIN show ON show._id = booking.show WHERE booking._id = $1", [id])
    const theater = await pool.query("SELECT _id, name, admin, contact, email, address FROM theater WHERE _id = $1", [booking2.rows[0].theater])
    res.json({show: booking2.rows[0], theater: theater.rows[0]})
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
}

module.exports = { register, login, getUser, getLocationTheaters, bookShow, getBooking };
