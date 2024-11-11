const express = require("express");
const pool = require("../config/db");
const { getAdapter } = require("axios");
const authenticate = require("../lib");

const app = express();

//Add adhkar
app.post("/api/addAdhkar", authenticate, async (req, res) => {
  const { anamaz_type, adhkar } = req.body;
  console.log(req.body);
  // return
  try {
    const addAdhkarQuery = `
            INSERT INTO adhkar (anamaz_type,adhkar)
            VALUES ($1,$2)
        `;
    await pool.query(addAdhkarQuery, [anamaz_type, adhkar]);

    res.status(200).send("Adhkar Added Successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get Adhkar
app.get("/api/getAdhkar", authenticate, async (req, res) => {
  try {
    const getAdhkar = "select * from adhkar";
    const adhkar = await pool.query(getAdhkar);

    res.status(200).json(adhkar.rows);
  } catch (error) {
    console.error(error);
  }
});

//update api for Hadeeth
app.put("/api/updateAdhkar/:adhkarid", authenticate, async (req, res) => {
  const { adhkarid } = req.params;
  const { anamaz_type, adhkar } = req.body;
  const adhkarJson = JSON.stringify(adhkar);
  console.log(adhkar);
  try {
    const existingHadeeth = await pool.query(
      `SELECT * FROM adhkar WHERE adhkar_id = $1`,
      [adhkarid]
    );

    if (existingHadeeth.rows.length === 0) {
      res.status(404).send("Adhkar Not Found");
    }

    const updateHadeethQuery = `
            UPDATE adhkar 
            SET adhkar = $1, anamaz_type = $2 
            WHERE adhkar_id = $3
        `;
    await pool.query(updateHadeethQuery, [adhkarJson, anamaz_type, adhkarid]);

    res.status(200).send("Hadeeth Updated Successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = app;
