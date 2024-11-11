const express = require("express");
const cors = require("cors");
// const pool = require("./config/db");
const app = express();
// const bcrypt = require("bcrypt");
const login = require("./login/index");
const trustee = require("./trustee/index");
const feature = require("./feature/index");
const subscription = require("./subscription/index");
const country = require("./country/index");
const otp = require("./otp/index");
const tvotp = require("./tvotp/index");
const masjid = require("./masjid/index");
const namaztimings = require("./namaztiming/index");
const hadeeth = require("./hadeeth/index");
const trusteehadeeth = require("./trusteehadeeth/index");
const adhkar = require("./adhkar/index");
const payment = require("./payment/index");
const apiforapp = require("./apiforapp")

require("dotenv").config();
app.use(express.json());
app.use(cors());
app.listen(4000, () => console.log("SERVER RUNNING ON PORT 4000"));
app.use(login);
app.use(trustee);
app.use(feature);
app.use(subscription);
app.use(country);
app.use(otp);
app.use(tvotp);
app.use(masjid);
app.use(namaztimings);
app.use(hadeeth);
app.use(trusteehadeeth);
app.use(adhkar);
app.use(payment);
app.use("/api", apiforapp);

const corsOptions = {
  origin: [
    // "http://localhost:3000",
    "http://192.168.1.40:3000",
    "https://admin.salahpulse.com",
    "https://salahpulse.com",
    "https://form.salahpulse.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow only specified HTTP methods
  // allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors());
