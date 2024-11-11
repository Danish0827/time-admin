const express = require("express");
const pool = require("../config/db");
const { randomInt } = require('crypto');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// POST route for sending OTP
app.post('/api/sendMasjid-otp',async (req, res) => {
    const { phone } = req.body;
  
    // Check if the phone number exists in the users table
    pool.query('SELECT * FROM users WHERE phone = $1', [phone], (error, results) => {
        if (error) {
          console.error("Error querying database:", error);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
      
        if (results.rowCount > 0) {
          // Phone number exists, generate OTP
          const otp = generateOTP();
          const userId = results?.rows[0].user_id;
      
          console.log(userId);
          // Update the user's record with the generated OTP
          pool.query('UPDATE users SET otp = $1 WHERE user_id = $2', [otp, userId], (error, results) => {
            if (error) {
              console.error("Error updating database:", error);
              return res.status(500).json({ message: 'Internal Server Error' });
            }
      
            // Send OTP to the user (You need to implement this part)
            console.log("OTP generated and sent to user:", otp);
            res.status(200).json({ message: 'OTP sent successfully' });
          });
        } else {
          // Phone number doesn't exist
          console.log("User not found with phone number:", phone);
          res.status(404).json({ message: 'Number is not Register, Kindly Contact Admin to Register' });
        }
      });
  });
  
  // Function to generate a 6-digit OTP
  function generateOTP() {
    return String(randomInt(100000, 999999));
  }
  
// verify-otp
app.post('/api/verifyMasjid-otp', async (req, res) => {
    const { phone, otp } = req.body;

    // Check if the phone number and OTP match in the users table
    pool.query('SELECT * FROM users WHERE phone = $1 AND otp = $2', [phone, otp], (error, results) => {
        if (error) {
            console.error("Error querying database:", error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.rowCount > 0) {
            // Phone number and OTP match
            const userId = results.rows[0].user_id;

            // Delete the OTP from the user's record
            pool.query('UPDATE users SET otp = NULL WHERE user_id = $1 RETURNING *', [userId], (error, results) => {
                if (error) {
                    console.error("Error updating database:", error);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                // Fetch masjid data associated with the user
                pool.query('SELECT * FROM masjid WHERE user_id = $1', [userId], (error, masjidResults) => {
                    if (error) {
                        console.error("Error querying masjids:", error);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }

                    const userData = results.rows[0];
                    const masjids = masjidResults.rows;

                    res.status(200).json({ userData, masjids, message: 'OTP verified successfully' });
                });
            });
        } else {
            // Phone number and OTP don't match
            console.log("Phone number and OTP don't match:", phone, otp);
            res.status(400).json({ message: 'Invalid OTP' });
        }
    });
});


// resend otp
app.post('/api/resendMasjid-otp', async (req, res) => {
    const { phone } = req.body;

    // Check if the phone number exists in the users table
    pool.query('SELECT * FROM users WHERE phone = $1', [phone], (error, results) => {
        if (error) {
            console.error("Error querying database:", error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.rowCount > 0) {
            // Phone number exists, generate OTP
            const otp = generateOTP();
            const userId = results.rows[0].user_id;

            console.log(userId);
            // Update the user's record with the generated OTP
            pool.query('UPDATE users SET otp = $1 WHERE user_id = $2', [otp, userId], (error, results) => {
                if (error) {
                    console.error("Error updating database:", error);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }

                // Send OTP to the user (You need to implement this part)
                console.log("OTP generated and sent to user:", otp);
                res.status(200).json({ message: 'OTP resent successfully' });
            });
        } else {
            // Phone number doesn't exist
            console.log("User not found with phone number:", phone);
            res.status(404).json({ message: 'Number is not Register, Kindly Contact Admin to Register' });
        }
    });
});

// verify masjid login
const { v4: uuidv4 } = require('uuid'); // Import UUID module

app.post('/api/verifyMasjid-login', async (req, res) => {
    const { masjid_id } = req.body;

    // Check if the masjid_id exists in the masjid table and session_id is null
    pool.query('SELECT * FROM masjid WHERE masjid_id = $1 AND session_id IS NULL', [masjid_id], (error, results) => {
        if (error) {
            console.error("Error querying masjid table:", error);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (results.rows.length > 0) {
            // Session ID is null, update with a new session ID
            const sessionId = uuidv4().slice(0, 6); // Generate alpha-numeric 6-length session ID
            pool.query('UPDATE masjid SET session_id = $1 WHERE masjid_id = $2', [sessionId, masjid_id], (error, updateResults) => {
                if (error) {
                    console.error("Error updating session ID:", error);
                    return res.status(500).json({ message: 'Internal Server Error' });
                }
                // Fetch the updated row from the database
                pool.query('SELECT * FROM masjid WHERE masjid_id = $1', [masjid_id], (error, updatedRowResults) => {
                    if (error) {
                        console.error("Error querying masjid table:", error);
                        return res.status(500).json({ message: 'Internal Server Error' });
                    }
                    res.status(200).json({ message: 'Login successful', masjid: updatedRowResults.rows[0] });
                });
            });
        } else {
            // Session ID is not null, masjid already logged in
            res.status(400).json({ message: 'Masjid already logged in' });
        }
    });
});



module.exports = app;