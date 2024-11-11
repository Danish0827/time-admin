const express = require("express");
const pool = require("../config/db");
const authenticate = require("../lib");
const Razorpay = require("razorpay");
var cors = require("cors");

const app = express();
app.use(cors());

const razorpay = new Razorpay({
  key_id: "rzp_test_b989gHOwGtPdeP",
  key_secret: "LHnJ5ghSX3gfW6Zq7eeUNMKI",
});

app.post("/api/createOrder", async (req, res) => {
  console.log("sajid");
  const { planAmount, countryCurrency } = req.body;
  const options = {
    amount: planAmount * 100,
    currency: countryCurrency,
    receipt: "order_rcptid_11",
  };
  try {
    const order = await razorpay.orders.create(options);

    res.json({ orderId: order.id, amount: planAmount * 100 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message }); // Changed statusCode to status
  }
});

app.post("/api/successPayment", async (req, res) => {
  const {
    planAmount,
    durationType,
    masjidId,
    masjidNames,
    trusteeNumber,
    trusteeName,
    countryCurrency,
    response,
  } = req.body;
  console.log(req.body);

  // Current date
  const today = new Date();

  // Formatting date to DD-MM-YYYY format
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const start_date = formatDate(today);

  // Function to add days to a date
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  let daysToAdd;

  // Determining number of days to add based on durationType
  switch (durationType) {
    case "Monthly":
      daysToAdd = 30;
      break;
    case "Quarterly":
      daysToAdd = 90;
      break;
    case "Yearly":
      daysToAdd = 365;
      break;
    default:
      // Default to 0 if durationType is not recognized
      daysToAdd = 0;
  }

  const futureDate = addDays(today, daysToAdd);
  const end_date = formatDate(futureDate);

  const success = "Success";

  try {
    const checkMasjidQuery = `SELECT end_date FROM user_subscription WHERE masjid_id = '${masjidId}' ORDER BY end_date DESC LIMIT 1`;
    const result = await pool.query(checkMasjidQuery);
    console.log(result.rows[0],"sajid result",result.rowCount,"ROWCOUNT");
    if (result.rowCount > 0) {
      console.log("ONE");
      // Masjid ID exists, update the end date
      const existingEndDate = result.rows[0].end_date;

      // Parse the existing end date from the database
      const existingDate = new Date(
        existingEndDate.split("-").reverse().join("-")
      );
      const newEndDate = formatDate(addDays(existingDate, daysToAdd));

      const updateEndDateQuery = `
        UPDATE user_subscription
        SET end_date = '${newEndDate}', amount_paid = amount_paid + '${planAmount}', payment_date = '${start_date}', transaction_id = '${response.razorpay_payment_id}', payment_status = '${success}', order_id = '${response.razorpay_order_id}', masjid_name = '${masjidNames}', order_signature = '${response.razorpay_signature}', trustee_name = '${trusteeName}', trustee_number = '${trusteeNumber}', country_currency = '${countryCurrency}'
        WHERE masjid_id = '${masjidId}' AND end_date = '${existingEndDate}'
      `;
      await pool.query(updateEndDateQuery);
    } else {

      console.log("TWOO");
      // Masjid ID does not exist, insert a new record
      const addPaymentQuery = `
        INSERT INTO user_subscription (masjid_id, duration_type, start_date, end_date, amount_paid, payment_date, transaction_id, payment_status, order_id, masjid_name, order_signature, trustee_name, trustee_number, country_currency)
        VALUES ('${masjidId}', '${durationType}', '${start_date}', '${end_date}', '${planAmount}', '${start_date}', '${response.razorpay_payment_id}', '${success}', '${response.razorpay_order_id}', '${masjidNames}', '${response.razorpay_signature}', '${trusteeName}', '${trusteeNumber}', '${countryCurrency}')
      `;
       const rrr =  await pool.query(addPaymentQuery);
       console.log(rrr.rows[0],"ss");
    }

    res.status(200).send("Sub-plan added successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// const durationType = 'qurterly';

module.exports = app;
