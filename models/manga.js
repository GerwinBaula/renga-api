const { publisherSchema } = require("./publisher");
const { genreSchema } = require("./genre");
const { authorSchema } = require("./author");
const Joi = require("joi");
const mongoose = require("mongoose");

const mangaSchema = new mongoose.Schema({
  title: {
    type: String,
    minlength: 2,
    maxlength: 50,
    required: true
  },
  author: {
    type: authorSchema,
    required: true
  },
  genre: {
    type: genreSchema,
    required: true
  },
  publisher: {
    type: publisherSchema,
    required: true
  },
  numberInStock: {
    type: Number,
    min: 0,
    max: 255,
    required: true
  },
  dailyRentalRate: {
    type: Number,
    min: 0,
    max: 255,
    required: true
  }
});

const Manga = mongoose.model("Manga", mangaSchema);

function validateManga(manga) {
  const schema = {
    title: Joi.string()
      .required()
      .min(2)
      .required()
      .max(50)
      .required(),
    authorId: Joi.objectId().required(),
    genreId: Joi.objectId().required(),
    publisherId: Joi.objectId().required(),
    numberInStock: Joi.number()
      .required()
      .min(0)
      .required()
      .max(255)
      .required(),
    dailyRentalRate: Joi.number()
      .required()
      .min(0)
      .required()
      .max(255)
      .required()
  };

  return Joi.validate(manga, schema);
}

module.exports.Manga = Manga;
module.exports.validate = validateManga;
