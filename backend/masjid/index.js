const express = require("express");
const pool = require("../config/db");
const app = express();
const authenticate = require("../lib");

// app.use(bodyParser.json());
// POST API endpoint to add users
app.post("/api/addMasjid", authenticate, async (req, res) => {
  const { masjid_name, user_id, location, country, state, city } = req.body;

  // console.log(req.body,"saif");

  try {
    // Insert Masjid Query
    const addMasjidQuery = `
      INSERT INTO masjid (masjid_name, user_id, location,  country,state,city)
      VALUES ($1, $2, $3, $4,$5,$6)
      RETURNING masjid_id
    `;

    const { rows } = await pool.query(addMasjidQuery, [
      masjid_name,
      user_id,
      location,
      country,
      state,
      city,
    ]);
    const masjidId = rows[0].masjid_id;
    console.log(masjidId, "msid");

    const addNamazTimingQuery = `
      INSERT INTO namaz_timingnew (masjid_id)
      VALUES ($1) returning *
    `;

    const r = await pool.query(addNamazTimingQuery, [masjidId]);
    console.log(r.rows, "addd r");
    res.status(200).json({ masjid_id: masjidId });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/addMasjidDataById/:masjid_id", async (req, res) => {
  const { masjid_id } = req.params;
  const { randomString } = req.body;

  try {
    const existingMasjid = await pool.query(
      `SELECT * FROM masjid WHERE masjid_id = ${masjid_id}`
    );

    if (existingMasjid.rows.length === 0) {
      return res.status(404).send("Masjid not found");
    }
    // Insert Masjid Query
    const addMasjidQuery = `
    UPDATE masjid
    SET weblocalcode = '${randomString}'
    WHERE masjid_id = '${masjid_id}'
    `;

    await pool.query(addMasjidQuery);
    // const masjidId = rows[0].masjid_id;

    res.status(200).send("codeadded added successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// GET API endpoint to retrieve all users
app.get("/api/getMasjid", authenticate, async (req, res) => {
  try {
    // Retrieve all users from the users table
    const getMasjidQuery = `
    SELECT masjid.*, users.trustee_name
    FROM masjid
    LEFT JOIN users ON masjid.user_id = users.user_id;    
`;
    const masjid = await pool.query(getMasjidQuery);
    const rowCount = masjid.rows.length;

    res.status(200).json({ masjid: masjid.rows, rowCount: rowCount });
    // res.status(200).json(users.rows);
  } catch (error) {
    // console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/getMasjidDataById/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Retrieve all users from the users table
    const getMasjidQuery = `
    SELECT * FROM masjid WHERE weblocalcode = $1
`;
    const masjid = await pool.query(getMasjidQuery, [id]);
    const rowCount = masjid.rows.length;

    res.status(200).json(masjid.rows);
    // res.status(200).json(users.rows);
  } catch (error) {
    // console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// PUT API endpoint to update feature details
app.put("/api/updateMasjid/:masjidid", authenticate, async (req, res) => {
  const { masjidid } = req.params;
  const { masjid_name, user_id, location, country, state, city } = req.body;

  // console.log(trustee_name);

  try {
    const existingMasjid = await pool.query(
      `SELECT * FROM masjid WHERE masjid_id = ${masjidid}`
    );

    if (existingMasjid.rows.length === 0) {
      return res.status(404).send("Masjid not found");
    }

    let updateMasjidQuery = "";
    let queryParams = [];

    if (typeof trustee_name === "string") {
      // If trustee_name is a string, include user_id in the update
      updateMasjidQuery = `
      UPDATE masjid
      SET masjid_name = $1, location = $2, country = $3, state = $4, city  = $5
      WHERE masjid_id = $6
      `;
      queryParams = [masjid_name, location, country, state, city, masjidid];
    } else {
      // If trustee_name is not a string, exclude user_id from the update
      updateMasjidQuery = `       
        UPDATE masjid
        SET masjid_name = $1, user_id = $2, location = $3,  country = $4, state = $5, city  = $6
        WHERE masjid_id = $7
      `;
      queryParams = [
        masjid_name,
        user_id,
        location,
        country,
        state,
        city,
        masjidid,
      ];
    }

    await pool.query(updateMasjidQuery, queryParams);

    res.status(200).send("Masjid Updated Successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//DELETE Developers Api
app.delete("/api/deleteMasjid/:masjidid", authenticate, async (req, res) => {
  try {
    const { masjidid } = req.params;
    console.log(req.params);

    const deleteNamazQuery = `DELETE FROM namaz_timingnew WHERE masjid_id = ${masjidid}`;
    await pool.query(deleteNamazQuery);

    // Then, delete the row from the masjid table
    const deleteMasjidQuery = `DELETE FROM masjid WHERE masjid_id = ${masjidid}`;
    await pool.query(deleteMasjidQuery);

    res
      .status(200)
      .send("Masjid and associated namaz timings deleted successfully!");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = app;
