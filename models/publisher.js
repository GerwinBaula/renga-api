const Joi = require("joi");
const mongoose = require("mongoose");

const publisherSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 50,
    required: true
  },
  website: {
    type: String,
    minlength: 7,
    maxlength: 50
  }
});

const Publisher = mongoose.model("Publisher", publisherSchema);

function validatePublisher(publisher) {
  const schema = {
    name: Joi.string()
      .required()
      .min(2)
      .required()
      .max(50)
      .required(),
    website: Joi.string()
      .required()
      .min(7)
      .required()
      .max(50)
      .required()
  };

  return Joi.validate(publisher, schema);
}

module.exports.publisherSchema = publisherSchema;
module.exports.Publisher = Publisher;
module.exports.validate = validatePublisher;
