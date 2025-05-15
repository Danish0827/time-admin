const express = require("express");
const pool = require("../config/db");
const { Server } = require("lucide-react");
const app = express();
const authenticate =require('../lib')

// POST API endpoint to add features
app.post("/api/addFeature",authenticate, async (req, res) => {
  const { feature_name, description, status } = req.body;
  console.log(req.body);

  try {
    const addFeatureQuery = `
        INSERT INTO features (feature_name,description,status)
        VALUES ('${feature_name}','${description}','${status}')
        `;
    await pool.query(addFeatureQuery);

    res.status(200).send("User added successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// GET API endpointN to retrieve all features
app.get("/api/getFeature",async (req, res) => {
  try {
    const addFeatureQuery = "SELECT * FROM features";
    const features = await pool.query(addFeatureQuery);

    const rowCount = features.rows.length;

    res.status(200).json({ features: features.rows, rowCount: rowCount });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


// PUT API endpoint to update feature details
app.put("/api/updateFeature/:featureid", authenticate,async (req, res) => {
  const { featureid } = req.params;
  const { feature_name, description, status } = req.body;

  try {
    const existingFeature = await pool.query(
      `SELECT * FROM features WHERE feature_id = ${featureid}`
    );

    if (existingFeature.rows.length === 0) {
      return res.status(404).send("Feature not found");
    }

    const updateFeatureQuery = `
            UPDATE features
            SET feature_name = $1, description = $2, status = $3
            WHERE feature_id = $4
        `;

    await pool.query(updateFeatureQuery, [
      feature_name,
      description,
      status,
      featureid,
    ]);

    res.status(200).send("Feature Updated Successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

//DELETE Developers Api
app.delete("/api/deleteFeature/:featureId",authenticate, async (req, res) => {
  try {
    const { featureId } = req.params;

    const query = `DELETE FROM features WHERE feature_id = ${featureId}`;
    const result = await pool.query(query);
    res.status(200).send("User deleted successfully!");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = app;
