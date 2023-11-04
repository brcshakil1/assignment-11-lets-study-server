// import libraries and middleware
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("LET'S STUDY WEBSITE IS RUNNING...");
});

app.listen(port, () => {
  console.log(`Lets study website is running on port: ${port}`);
});
