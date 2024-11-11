const express = require("express");
const pool = require("../config/db");
const { randomInt } = require("crypto");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());

// POST route for sending OTP
app.post("/api/send-otp", async (req, res) => {
  const { phone } = req.body;

  // Check if the phone number exists in the users table
  pool.query(
    "SELECT * FROM users WHERE phone = $1",
    [phone],
    (error, results) => {
      if (error) {
        console.error("Error querying database:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (results.rowCount > 0) {
        // Phone number exists, generate OTP
        const otp = generateOTP();
        const userId = results?.rows[0].user_id;

        console.log(userId);
        // Update the user's record with the generated OTP
        pool.query(
          "UPDATE users SET otp = $1 WHERE user_id = $2",
          [otp, userId],
          (error, results) => {
            if (error) {
              console.error("Error updating database:", error);
              return res.status(500).json({ message: "Internal Server Error" });
            }

            // Send OTP to the user (You need to implement this part)
            console.log("OTP generated and sent to user:", otp);
            res.status(200).json({ message: "OTP sent successfully" });
          }
        );
      } else {
        // Phone number doesn't exist
        console.log("User not found with phone number:", phone);
        res.status(404).json({
          message: "Number is not Register, Kindly Contact Admin to Register",
        });
      }
    }
  );
});

// Function to generate a 6-digit OTP
function generateOTP() {
  return String(randomInt(100000, 999999));
}

// verify-otp
app.post("/api/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;

  // Check if the phone number and OTP match in the users table
  pool.query(
    "SELECT * FROM users WHERE phone = $1",
    [phone],
    (error, results) => {
      if (error) {
        console.error("Error querying database:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (results.rowCount > 0) {
        // Phone number and OTP match
        const userId = results.rows[0].user_id;

        // Delete the OTP from the user's record
        pool.query(
          "UPDATE users SET otp = NULL WHERE user_id = $1 RETURNING *",
          [userId],
          (error, results) => {
            if (error) {
              console.error("Error updating database:", error);
              return res.status(500).json({ message: "Internal Server Error" });
            }

            // Fetch data from masjid table based on userId
            pool.query(
              "SELECT * FROM masjid WHERE user_id = $1",
              [userId],
              (error, masjidResults) => {
                if (error) {
                  console.error("Error querying masjid table:", error);
                  return res
                    .status(500)
                    .json({ message: "Internal Server Error" });
                }

                const responseData = {
                  userData: results.rows[0],
                  masjidData: masjidResults.rows, // Include masjid data in response
                };

                const token = jwt.sign(
                  { id: responseData.userData.user_id },
                  process.env.SECRET_KEY,
                  {
                    expiresIn: "14h", // Token expires in 7 hour
                  }
                );

                // Calculate the expiry time based on the 'expiresIn' option
                const expiryTime = new Date(Date.now() + 14 * 60 * 60 * 1000); // 14 hours from now
                console.log(token);
                res.status(200).send({
                  status: 200,
                  message: "Trustee Login successful.",
                  data: responseData,
                  token,
                  expiryTime,
                });

                // res.status(200).json({ data: responseData, message: 'OTP verified successfully' });
              }
            );
          }
        );
      } else {
        // Phone number and OTP don't match
        console.log("Phone number and OTP don't match:", phone, otp);
        res.status(400).json({ message: "Invalid OTP" });
      }
    }
  );
});

app.post("/api/validateUser", async (req, res) => {
  console.log(req.body);
  const userId = req.body.userId; // Assuming userId is a property of the request body
  const query = `SELECT * FROM admin WHERE id = $1`;
  try {
    const result = await pool.query(query, [userId]);
    if (result.rows.length > 0) {
      // User with the provided user ID exists in the database
      res.status(200).send({ isValid: true });
    } else {
      // User with the provided user ID does not exist in the database
      res.status(401).send({ isValid: false });
    }
  } catch (error) {
    // Handle database query errors
    console.error("Error validating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// resend otp
app.post("/api/resend-otp", async (req, res) => {
  const { phone } = req.body;

  // Check if the phone number exists in the users table
  pool.query(
    "SELECT * FROM users WHERE phone = $1",
    [phone],
    (error, results) => {
      if (error) {
        console.error("Error querying database:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      if (results.rowCount > 0) {
        // Phone number exists, generate OTP
        const otp = generateOTP();
        const userId = results.rows[0].user_id;

        console.log(userId);
        // Update the user's record with the generated OTP
        pool.query(
          "UPDATE users SET otp = $1 WHERE user_id = $2",
          [otp, userId],
          (error, results) => {
            if (error) {
              console.error("Error updating database:", error);
              return res.status(500).json({ message: "Internal Server Error" });
            }

            // Send OTP to the user (You need to implement this part)
            console.log("OTP generated and sent to user:", otp);
            res.status(200).json({ message: "OTP resent successfully" });
          }
        );
      } else {
        // Phone number doesn't exist
        console.log("User not found with phone number:", phone);
        res.status(404).json({
          message: "Number is not Register, Kindly Contact Admin to Register",
        });
      }
    }
  );
});

// GET API subscription plan
app.get("/api/getSubscriptionPlan", async (req, res) => {
  try {
    const getSubscriptionPlanQuery = `
    SELECT 
    sp.plan_id AS plan_id,
    sp.plan_name AS plan_name,
    sp.plan_details AS plan_details,
    sp.plan_status AS plan_status,
    (
        SELECT JSON_ARRAYAGG(
            json_build_object(
                'feature_id', f.feature_id,
                'feature_name', f.feature_name,
                'status', f.status
            )
        ) 
        FROM plan_feature pf 
        JOIN features f ON pf.feature_id = f.feature_id
        WHERE sp.plan_id = pf.plan_id
    ) AS features,
    (
        SELECT JSON_ARRAYAGG(
            json_build_object(
                'duration_id', pd.duration_id,
                'duration_type', pd.duration_type,
                'country_id', cp.country_id,
                'plan_price', cp.plan_price
            )
        ) 
        FROM plan_durations pd
        JOIN country_price cp ON pd.duration_id = cp.duration_id
        WHERE sp.plan_id = pd.plan_id
    ) AS plan_durations
FROM 
    subscription_plan sp
WHERE 
    sp.plan_status = true
    AND EXISTS (
        SELECT 1
        FROM plan_durations pd
        JOIN country_price cp ON pd.duration_id = cp.duration_id
        WHERE sp.plan_id = pd.plan_id AND cp.country_id = 103
    )
GROUP BY 
    sp.plan_id, sp.plan_name, sp.plan_details, sp.plan_status;

    `;
    const subscriptionPlan = await pool.query(getSubscriptionPlanQuery);

    const rowCount = subscriptionPlan.rows.length;

    res
      .status(200)
      .json({ subscriptionPlan: subscriptionPlan.rows, rowCount: rowCount });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = app;
