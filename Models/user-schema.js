const mongoose = require("mongoose");
const unique_validator = require("mongoose-unique-validator");

const schema = mongoose.Schema;

const userSchema = new schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }],
});

userSchema.plugin(unique_validator);

module.exports = mongoose.model("User", userSchema);
