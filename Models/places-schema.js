const mongoose = require("mongoose");

const schema = mongoose.Schema;

const Place = new schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  img: { type: String, required: true },
  // address : {type : String , required  : true},
  user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Place", Place);
