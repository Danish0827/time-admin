const express = require("express");
const pool = require("../config/db");
const authenticate = require('../lib')
// const { Server } = require("lucide-react");
const app = express();

// GET API endpoint to retrieve all features
app.get("/api/getCountry", async (req, res) => {
  try {
    const getCountryQuery = "SELECT * FROM countries";
    const country = await pool.query(getCountryQuery);

    res.status(200).json(country.rows); // Assuming you want to send the features as JSON
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// GET API endpoint to retrieve all features
app.post("/api/postCountry", async (req, res) => {
  const { countryCode } = req.body;
  try {
    const getCountryQuery = `SELECT * FROM countries where country_code = '${countryCode}'`;
    const country = await pool.query(getCountryQuery);

    res.status(200).json(country.rows); // Assuming you want to send the features as JSON
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// GET API endpoint to retrieve all features
app.get("/api/getSubscriptionwithcountryid/:countryId", async (req, res) => {
  const { countryId } = req.params;

  // console.log(countryId);

  try {
    const existingFeature = await pool.query(
      `
    SELECT
    sp.plan_id AS plan_id,
    sp.plan_name AS plan_name,
    sp.plan_details AS plan_details,
    sp.plan_status AS status,
    (SELECT EXISTS(SELECT 1 FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'monthly' LIMIT 1)) AS monthly,
    (SELECT EXISTS(SELECT 1 FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'quarterly' LIMIT 1)) AS quarterly,
    (SELECT EXISTS(SELECT 1 FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'yearly' LIMIT 1)) AS yearly,
    (SELECT cp.country_id FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id LIMIT 1) AS country_id,
    (SELECT cp.plan_price FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'monthly' LIMIT 1) AS monthly_price,
    (SELECT cp.plan_price FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'quarterly' LIMIT 1) AS quarterly_price,
    (SELECT cp.plan_price FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'yearly' LIMIT 1) AS yearly_price
FROM
    subscription_plan sp
LEFT JOIN
    plan_feature pf ON sp.plan_id = pf.plan_id
WHERE
    (SELECT cp.country_id FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id LIMIT 1) = '${countryId}'
GROUP BY
    sp.plan_id, sp.plan_name, sp.plan_details, sp.plan_status;
    `
    );

    if (existingFeature.rows.length === 0) {
      const getSubscriptionsQuery = `
      SELECT
      sp.plan_id AS plan_id,
      sp.plan_name AS plan_name,
      sp.plan_details AS plan_details,
      sp.plan_status AS status,
      (SELECT EXISTS(SELECT 1 FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'monthly' LIMIT 1)) AS monthly,
      (SELECT EXISTS(SELECT 1 FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'quarterly' LIMIT 1)) AS quarterly,
      (SELECT EXISTS(SELECT 1 FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'yearly' LIMIT 1)) AS yearly,
      (SELECT cp.country_id FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id LIMIT 1) AS country_id,
      (SELECT cp.plan_price FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'monthly' LIMIT 1) AS monthly_price,
      (SELECT cp.plan_price FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'quarterly' LIMIT 1) AS quarterly_price,
      (SELECT cp.plan_price FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'yearly' LIMIT 1) AS yearly_price
  FROM
      subscription_plan sp
  LEFT JOIN
      plan_feature pf ON sp.plan_id = pf.plan_id
  WHERE
      (SELECT cp.country_id FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id LIMIT 1) = 237
  GROUP BY
      sp.plan_id, sp.plan_name, sp.plan_details, sp.plan_status;
      `;

      const { rows } = await pool.query(getSubscriptionsQuery);

      res.status(200).json(rows);
    } else {
      const getSubscriptionsQuery = `
    SELECT
    sp.plan_id AS plan_id,
    sp.plan_name AS plan_name,
    sp.plan_details AS plan_details,
    sp.plan_status AS status,
    (SELECT EXISTS(SELECT 1 FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'monthly' LIMIT 1)) AS monthly,
    (SELECT EXISTS(SELECT 1 FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'quarterly' LIMIT 1)) AS quarterly,
    (SELECT EXISTS(SELECT 1 FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'yearly' LIMIT 1)) AS yearly,
    (SELECT cp.country_id FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id LIMIT 1) AS country_id,
    (SELECT cp.plan_price FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'monthly' LIMIT 1) AS monthly_price,
    (SELECT cp.plan_price FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'quarterly' LIMIT 1) AS quarterly_price,
    (SELECT cp.plan_price FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'yearly' LIMIT 1) AS yearly_price
FROM
    subscription_plan sp
LEFT JOIN
    plan_feature pf ON sp.plan_id = pf.plan_id
WHERE
    (SELECT cp.country_id FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id LIMIT 1) =  '${countryId}'
GROUP BY
    sp.plan_id, sp.plan_name, sp.plan_details, sp.plan_status;
    `;

      const { rows } = await pool.query(getSubscriptionsQuery);

      res.status(200).json(rows);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// GET API endpoint to retrieve all features
app.get("/api/getPlanSubscription",authenticate, async (req, res) => {
  try {
    const getCountryQuery = "SELECT * FROM user_subscription";
    const country = await pool.query(getCountryQuery);

    res.status(200).json(country.rows); // Assuming you want to send the features as JSON
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/api/updateConvergence",authenticate, async (req, res) => {
  console.log(req.body);
  const { convergencesData } = req.body;

  try {
    // Insert Masjid Query
    const addMasjidQuery = `
      UPDATE country_convergence
      SET convergence_type = $1
      WHERE convergence_id = 1
    `;
    await pool.query(addMasjidQuery, [convergencesData]);

    res.status(200).send("Masjid added successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// GET API endpoint to retrieve all features
// GET API endpoint to retrieve all features
app.get("/api/getConvergence", async (req, res) => {
  try {
    const getConvergenceQuery =
      "SELECT convergence_type FROM country_convergence"; // Select only convergence_type
    const convergenceData = await pool.query(getConvergenceQuery);

    const convergenceTypes = convergenceData.rows.map(
      (row) => row.convergence_type
    ); // Extracting convergence_type values

    res.status(200).json(convergenceTypes[0]); // Sending only convergence_type values as JSON
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = app;
