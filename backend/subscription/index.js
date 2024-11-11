const express = require("express");
const pool = require("../config/db");
// const { Server } = require("lucide-react");
const app = express();
const authenticate = require('../lib')

// POST API endpoint to add features
app.post("/api/addSubscription",authenticate, async (req, res) => {
  const {
    plan_name,
    plan_details,
    plan_feature,
    country_id,
    monthly,
    monthly_price,
    quarterly,
    quarterly_price,
    yearly,
    yearly_price,
    status,
  } = req.body;

  
  try {
    // Step 1: Insert a new subscription plan
    const addSubscriptionQuery = `
      INSERT INTO subscription_plan (plan_name, plan_details, plan_status)
      VALUES ($1, $2, $3)
      RETURNING plan_id;
    `;

    const { rows } = await pool.query(addSubscriptionQuery, [plan_name, plan_details, status]);

    if (!rows || !rows[0] || !rows[0].plan_id) {
      throw new Error("Error inserting subscription plan");
    }

    const insertedPlanId = rows[0].plan_id;

    // Step 2: Insert records into the plan_feature table for all selected features
    const featureIdsString = plan_feature.map((featureId, index) => `$${index + 1}`).join(', ');

    const addPlanFeatureQuery = `
      INSERT INTO plan_feature (plan_id, feature_id)
      SELECT ${insertedPlanId}, feature_id
      FROM features
      WHERE feature_id IN (${featureIdsString});
    `;

    await pool.query(addPlanFeatureQuery, plan_feature);

    // Step 3: Conditionally insert data into the plan_durations table and country_price table
    if (monthly) {
      await insertDurationAndPrice(insertedPlanId, 'monthly', monthly_price, country_id);
    }

    if (quarterly) {
      await insertDurationAndPrice(insertedPlanId, 'quarterly', quarterly_price, country_id);
    }

    if (yearly) {
      await insertDurationAndPrice(insertedPlanId, 'yearly', yearly_price, country_id);
    }

    res.status(200).send("Subscription added successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

async function insertDurationAndPrice(planId, durationType, price, countryId) {
  const addPlanDurationQuery = `
    INSERT INTO plan_durations (plan_id, duration_type)
    VALUES ($1, $2)
    RETURNING duration_id;
  `;
  const { rows } = await pool.query(addPlanDurationQuery, [planId, durationType]);
  if (!rows || !rows[0] || !rows[0].duration_id) {
    throw new Error(`Error inserting ${durationType} duration`);
  }

  const durationId = rows[0].duration_id;

  const addCountryPriceQuery = `
    INSERT INTO country_price (duration_id, country_id, plan_price)
    VALUES ($1, $2, $3);
  `;
  await pool.query(addCountryPriceQuery, [durationId, countryId, price]);
}


// GET API endpoint to retrieve all features
app.get("/api/getSubscription",authenticate, async (req, res) => {
  try {
    const getSubscriptionsQuery = `
    SELECT
    sp.plan_id AS plan_id,
    sp.plan_name AS plan_name,
    sp.plan_details AS plan_details,
    sp.plan_status AS status,
    json_agg(pf.feature_id) AS plan_feature,
    (SELECT EXISTS(SELECT 1 FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'monthly' LIMIT 1))
    AS monthly,
    (SELECT EXISTS(SELECT 1 FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'quarterly' LIMIT 1))
    AS quarterly,
    (SELECT EXISTS(SELECT 1 FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'yearly' LIMIT 1))
    AS yearly,
    (SELECT cp.country_id FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id LIMIT 1) AS country_id,
    (SELECT cp.plan_price FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'monthly' LIMIT 1) AS monthly_price,
    (SELECT cp.plan_price FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'quarterly' LIMIT 1) AS quarterly_price,
    (SELECT cp.plan_price FROM country_price cp JOIN plan_durations pd ON cp.duration_id = pd.duration_id WHERE pd.plan_id = sp.plan_id AND pd.duration_type = 'yearly' LIMIT 1) AS yearly_price
FROM
    subscription_plan sp
LEFT JOIN
    plan_feature pf ON sp.plan_id = pf.plan_id
GROUP BY
    sp.plan_id, sp.plan_name, sp.plan_details, sp.plan_status;


    `;

    const { rows } = await pool.query(getSubscriptionsQuery);
    const rowCount = rows.length;

    res.status(200).json({plan:rows,rowCount:rowCount});
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


// PUT API endpoint to update feature details
app.put("/api/updateSubscription/:planId",authenticate, async (req, res) => {
  const planId = req.params.planId;
  const {
    plan_name,
    plan_details,
    plan_feature,
    monthly,
    monthly_price,
    quarterly,
    quarterly_price,
    yearly,
    yearly_price,
    status,
  } = req.body;

  try {
    // Update subscription plan details
    const updateSubscriptionQuery = `
      UPDATE subscription_plan
      SET plan_name = $1, plan_details = $2, plan_status = $3
      WHERE plan_id = $4
    `;
    await pool.query(updateSubscriptionQuery, [plan_name, plan_details, status, planId]);

    // Delete existing plan features
    const deletePlanFeatureQuery = `
      DELETE FROM plan_feature WHERE plan_id = $1
    `;
    await pool.query(deletePlanFeatureQuery, [planId]);

    // Insert new plan features
    for (const featureId of plan_feature) {
      const addPlanFeatureQuery = `
        INSERT INTO plan_feature (plan_id, feature_id) VALUES ($1, $2)
      `;
      await pool.query(addPlanFeatureQuery, [planId, featureId]);
    }

    // Update plan durations and prices if provided
    // Note: You need to implement this part based on your specific requirements

    res.status(200).json({ message: "Subscription plan and related records updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


//DELETE Developers Api
app.delete("/api/deleteSubscription/:planId",authenticate, async (req, res) => {
  const planId = req.params.planId;

  try {
    // Delete records from plan_feature table
    const deletePlanFeatureQuery = `
      DELETE FROM plan_feature WHERE plan_id = $1
    `;
    await pool.query(deletePlanFeatureQuery, [planId]);

    // Get the duration IDs associated with the plan
    const getDurationIdsQuery = `
      SELECT duration_id FROM plan_durations WHERE plan_id = $1
    `;
    const { rows: durationRows } = await pool.query(getDurationIdsQuery, [planId]);

    // Delete records from the country_price table based on the obtained duration IDs
    for (const durationRow of durationRows) {
      const deleteCountryPriceQuery = `
        DELETE FROM country_price WHERE duration_id = $1
      `;
      await pool.query(deleteCountryPriceQuery, [durationRow.duration_id]);
    }

    // Delete records from plan_durations table
    const deletePlanDurationsQuery = `
      DELETE FROM plan_durations WHERE plan_id = $1
    `;
    await pool.query(deletePlanDurationsQuery, [planId]);

    // Delete the subscription plan from subscription_plan table
    const deleteSubscriptionQuery = `
      DELETE FROM subscription_plan WHERE plan_id = $1
    `;
    await pool.query(deleteSubscriptionQuery, [planId]);

    res.status(200).json({ message: "Subscription plan and related records deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


module.exports = app;
