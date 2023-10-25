const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const placeRoutes = require("./routes/placesRoutes");
const userRoutes = require("./routes/userRoutes");

const uri = `mongodb+srv://geobook:CZ1Q8jiVJTDAdGwX@cluster0.2wyumqd.mongodb.net/geobook?retryWrites=true&w=majority`;

const app = express();

app.use(bodyparser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/places", placeRoutes);
app.use("/api/user", userRoutes);

//learn below code :
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  console.log(error);
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured" });
});

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected !!");
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    return console.log(err);
  });
