const httpError = require("../Models/Http-errors");
const { validationResult } = require("express-validator");
const User = require("../Models/user-schema");
const Http_error = require("../Models/Http-errors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { create } = require("../Models/places-schema");

const getUser = async (req, res, next) => {
  let getUser;

  try {
    getUser = await User.find({}, "-password");
  } catch (error) {
    return next(new Http_error("Fetching User Failed", 500));
  }

  res.status(200).json({
    users: getUser.map((user) => user.toObject({ getters: true })),
  });
};

const signUpUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    next(new httpError("Please enter valid data in given fields", 422));
  }

  const { name, username, email, password, Udesc } = req.body;

  let emailExist;

  try {
    emailExist = await User.findOne({ email: email });
  } catch (error) {
    return next(new Http_error("Email retrieving failed ", 500));
  }

  if (emailExist) {
    return next(new httpError("Email Already Exist", 422));
  }

  let usernameExist;
  try {
    usernameExist = await User.findOne({ username: username });
  } catch (error) {
    return next(new Http_error("Username retrieving failed ", 500));
  }

  if (usernameExist) {
    return next(new httpError("Username already sccoped , sry !!", 422));
  }

  let hashedPassword;

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new Http_error("Something went wrong", 500);
    return next(error);
  }

  const createUser = new User({
    name: name,
    username: username,
    Udesc: Udesc,
    email: email,
    password: hashedPassword,
    img: req.file.path,
  });

  try {
    await createUser.save();
  } catch (error) {
    return next(new Http_error("User can't be saved !", 500));
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: createUser.id,
        email: createUser.email,
      },
      process.env.SECURE_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new Http_error("token generation failed", 500));
  }

  res
    .status(201)
    .json({ userId: createUser.id, email: createUser.email, token: token });
};

const loginUser = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    new httpError("Please enter valid data in given feilds", 422);
  }
  const { email, password } = req.body;
  let isUser;
  try {
    isUser = await User.findOne({ email: email });
  } catch (error) {
    return next(new httpError("Server Error", 500));
  }

  if (!isUser) {
    return next(new httpError("Invalid Username or Password", 403));
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, isUser.password);
  } catch (err) {
    const error = new Http_error("Something went wrong", 500);
    return next(error);
  }

  if (!isValidPassword) {
    return next(new httpError("Invalid Username or Password", 403));
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: isUser.id,
        email: isUser.email,
      },
      process.env.SECURE_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new Http_error("token generation failed", 500));
  }

  // console.log(isUser.id)

  res
    .status(200)
    .json({ userId: isUser.id, email: isUser.email, token: token });
};

exports.getUser = getUser;
exports.signUpUser = signUpUser;
exports.loginUser = loginUser;
