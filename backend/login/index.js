const express = require("express");
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const app = express();
const jwt = require("jsonwebtoken");

app.post("/api/login", async (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];

  try {
    const loginQuery = `SELECT * FROM admin WHERE email = '${email}'`;

    const result = await pool.query(loginQuery);

    if (result.rows.length === 0) {
      // console.log("Data Not Found");
      return res.status(404).send("User not found!");
    }

    const storedHashedPassword = result.rows[0].password;
    const adminUser = result.rows[0];

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, storedHashedPassword);

    if (!passwordMatch) {
      // console.log("Incorrect Password");
      return res.status(401).send("Incorrect password");
    }

    const token = jwt.sign({ id: adminUser.id }, process.env.SECRET_KEY, {
      expiresIn: "1h", // Token expires in 7 hour
    });

    // Calculate the expiry time based on the 'expiresIn' option
    const expiryTime = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hours from now

    res.status(200).send({
      status: 200,
      message: "Admin Login successful.",
      token,
      expiryTime,
    });
  } catch (error) {
    // console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = app;
