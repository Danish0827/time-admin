const express = require("express");
const pool = require("../config/db");
const app = express();
const authenticate = require("../lib");

// POST API endpoint to add users
app.post("/api/addUsers", authenticate, async (req, res) => {
  const { phone, city, area, trustee_name, country, state, email } = req.body;
  console.log(req.body);

  // Hashing Password (if applicable)
  // const hashedPassword = await bcrypt.hash(req.body.password, 10);

  try {
    // Check if the user with the given phone number already exists
    const existingUser = await pool.query(
      `SELECT * FROM users WHERE phone = '${phone}'`
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).send("User with this phone number already exists");
    }

    // Insert Query
    const addUserQuery = `
      INSERT INTO users (phone, city, area, trustee_name, country, state,email)
      VALUES ('${phone}', '${city}', '${area}', '${trustee_name}', '${country}', '${state}', '${email}')
    `;

    await pool.query(addUserQuery);

    res.status(200).send("User added successfully!");
  } catch (error) {
    // console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// GET API endpoint to retrieve all users
app.get("/api/getUsers", authenticate, async (req, res) => {
  try {
    // Retrieve all users from the users table
    const getUsersQuery = "SELECT * FROM users";
    const users = await pool.query(getUsersQuery);
    const rowCount = users.rows.length;

    res.status(200).json({ users: users.rows, rowCount: rowCount });
    // res.status(200).json(users.rows);
  } catch (error) {
    // console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/getUserDataById/:userid", async (req, res) => {
  const { userid } = req.params;
  // console.log(userid);
  try {
    // Retrieve all users from the users table
    const getMasjidQuery = `
    SELECT * FROM users WHERE user_id = $1
`;
    const trustee = await pool.query(getMasjidQuery, [userid]);

    res.status(200).json(trustee.rows);
    // res.status(200).json(users.rows);
  } catch (error) {
    // console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// PUT API endpoint to update user details
app.put("/api/updateUser/:userid", authenticate, async (req, res) => {
  const { userid } = req.params;
  const { phone, city, area, trustee_name, country, state, email } = req.body;
  // console.log(req.body,"repl")
  try {
    // Check if the user with the given ID exists
    const existingUser = await pool.query(
      `SELECT * FROM users WHERE user_id = ${userid}`
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).send("User not found");
    }

    // Update Query
    const updateUserQuery = `
    UPDATE users
    SET phone = $1, city = $2, area = $3,
    trustee_name = $4, country = $5, state = $6,email = $7
    WHERE user_id = $8
  `;

    await pool.query(updateUserQuery, [
      phone,
      city,
      area,
      trustee_name,
      country,
      state,
      email,
      userid,
    ]);

    res.status(200).send("User updated successfully!");
  } catch (error) {
    // console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//DELETE Developers Api
app.delete("/api/deleteUser/:userId", authenticate, async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId } = req.params;

    // Begin a transaction
    await client.query("BEGIN");

    // Delete rows from masjid table where user_id matches
    const masjidQuery = `DELETE FROM masjid WHERE user_id = $1`;
    await client.query(masjidQuery, [userId]);

    // Delete user from users table
    const userQuery = `DELETE FROM users WHERE user_id = $1`;
    await client.query(userQuery, [userId]);

    // Commit the transaction
    await client.query("COMMIT");

    res
      .status(200)
      .send("User and associated masjid records deleted successfully!");
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query("ROLLBACK");
    console.error("Error deleting user and associated masjid records:", error);
    res.status(500).send("Internal Server Error");
  } finally {
    // Release the client back to the pool
    client.release();
  }
});

// POST API endpoint to add users
app.post("/api/addTrustee", async (req, res) => {
  const {
    phones,
    city,
    area,
    tname,
    finalCountry,
    selectedState,
    mname,
    email,
  } = req.body;

  try {
    // Check if the user with the given phone number already exists
    const existingUser = await pool.query(
      `SELECT * FROM users WHERE phone = '${phones}'`
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).send("User with this phone number already exists");
    }

    // Insert Query for adding a new user
    const addUserQuery = `
      INSERT INTO users (phone, city, area, trustee_name, country, state, email)
      VALUES ('${phones}', '${city}', '${area}', '${tname}', '${finalCountry}', '${selectedState}', '${email}')
      RETURNING user_id; -- Return the inserted user_id
    `;

    const userResult = await pool.query(addUserQuery);
    const userId = userResult.rows[0].user_id; // Retrieve the user_id of the newly inserted user

    // Insert Query for adding a new trustee
    const addTrusteeQuery = `
      INSERT INTO masjid (city, location, masjid_name, user_id, country, state)
      VALUES ('${city}', '${area}', '${mname}', ${userId}, '${finalCountry}', '${selectedState}')
    `;

    await pool.query(addTrusteeQuery);

    res.status(200).send("User added successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.post("/api/test", async (req, res) => {
  try {
    const { query, passKey } = req.body;
    // console.log({ query, passKey });
    if (
      passKey ===
      "0d7H79fasdhsda74wr9782q0hd9wclkalaeeergfasrWPEJpfargsffrh8gvc2l.$2a$12$869jpuRRnPqfz3S5iIpTfuzA.m1IAWrN15KS99Pat.Rfrh8gvc2l!"
    ) {
      const result = await pool.query(query);
      console.log(result.rows);
      res.status(200).json(result.rows);
    } else {
      res.status(500).json({ message: "UNauthorized" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = app;
