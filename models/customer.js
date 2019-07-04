const Joi = require("joi");
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  },
  isGold: {
    type: Boolean,
    default: false
  },
  phone: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50
  }
});

const Customer = mongoose.model("Customer", customerSchema);

function validateCustomer(customer) {
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
    isGold: Joi.boolean().required(),
    phone: Joi.string()
      .required()
      .min(2)
      .required()
      .max(50)
      .required()
  };

  return Joi.validate(customer, schema);
}

exports.customerSchema = customerSchema;
exports.Customer = Customer;
exports.validate = validateCustomer;
