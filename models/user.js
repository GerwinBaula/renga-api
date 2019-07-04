const jwt = require("jsonwebtoken");
const config = require("config");
const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    minlength: 2,
    maxlength: 50,
    required: true
  },
  lastName: {
    type: String,
    minlength: 2,
    maxlength: 50,
    required: true
  },
  email: {
    type: String,
    minlength: 2,
    maxlength: 50,
    unique: true,
    required: true
  },
  password: {
    type: String,
    minlength: 3,
    required: true
  },
  isAdmin: Boolean
});

userSchema.methods.generateAuthToken = function() {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = {
    firstName: Joi.string()
      .required()
      .min(2)
      .required()
      .max(50)
      .required(),
    lastName: Joi.string()
      .required()
      .min(2)
      .required()
      .max(50)
      .required(),
    email: Joi.string()
      .email({ minDomainAtoms: 2 })
      .required()
      .min(2)
      .required()
      .max(50)
      .required(),
    password: Joi.string()
      .required()
      .min(3)
      .required()
  };

  return Joi.validate(user, schema);
}

module.exports.validate = validateUser;
module.exports.User = User;
