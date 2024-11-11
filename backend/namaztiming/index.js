const express = require("express");
const pool = require("../config/db");
const axios = require('axios');
const authenticate = require('../lib')

const app = express();

// POST endpoint for your API
app.post('/api/addNamazTimings',authenticate, async (req, res) => {
    const { city, method, school } = req.body;
  
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
                    const chaashts= chaasht;
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


// GET API endpointN to retrieve all getNamazTimings
app.get("/api/getNamazTimings",authenticate, async (req, res) => {
  try {
    const addNamazTimingsQuery = "SELECT * FROM global_timing";
    const namaztiming = await pool.query(addNamazTimingsQuery);

    const rowCount = namaztiming.rows.length;

    res.status(200).json({ namaztiming: namaztiming.rows, rowCount: rowCount });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// PUT API endpoint to update feature details
app.put("/api/updateNamazTimings/:timingid", authenticate, async (req, res) => {
  const { timingid } = req.params;
  const { fajr_azan,fajr_jamat,fajr_auto, zohar_azan,zohar_jamat,zohar_auto,asr_azan,asr_jamat,asr_auto,maghrib_azan,maghrib_jamat,maghrib_auto,isha_azan,isha_jamat,isha_auto,ishraaq, chaasht,jumma_azan,jumma_jamat1,jumma_jamat2,jumma_jamat3,jumma_jamat4 } = req.body;

  try {    
    const existingNamazTiming = await pool.query(
      `SELECT * FROM namaz_timingnew WHERE masjid_id = ${timingid}`
    );

    if (existingNamazTiming.rows.length === 0) {
      return res.status(404).send("Feature not found");
    }

    const updateNamazTimingQuery = `
            UPDATE namaz_timing
            SET fajr_azan = $1,fajr_jamat =$2,fajr_auto = $3 , zohar_azan = $4,
            zohar_jamat=$5,zohar_auto=$6,asr_azan=$7,asr_jamat = $8,asr_auto=$9,maghrib_azan=$10,
            maghrib_jamat=$11,maghrib_auto=$12,isha_azan=$13,isha_jamat=$14,isha_auto=$15,ishraaq=$16, 
            chaasht=$17,jumma_azan=$18,jumma_jamat1=$19,jumma_jamat2=$20,jumma_jamat3=$21,jumma_jamat4=$22
            WHERE masjid_id = $23
        `;

    await pool.query(updateNamazTimingQuery, [
      fajr_azan,fajr_jamat,fajr_auto, zohar_azan,zohar_jamat,zohar_auto,asr_azan,asr_jamat,asr_auto,maghrib_azan,maghrib_jamat,maghrib_auto,isha_azan,isha_jamat,isha_auto,ishraaq, chaasht,jumma_azan,jumma_jamat1,jumma_jamat2,jumma_jamat3,jumma_jamat4,timingid
    ]);

    res.status(200).send("Namaz Timing Updated Successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});



module.exports =app