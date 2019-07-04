const { authorSchema } = require("./author");
const { genreSchema } = require("./genre");
const { publisherSchema } = require("./publisher");
const moment = require("moment");
const Joi = require("joi");
const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
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
    })
  },
  manga: {
    type: new mongoose.Schema({
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
      dailyRentalRate: {
        type: Number,
        min: 0,
        max: 255,
        required: true
      }
    }),
    required: true
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now
  },
  dateReturned: {
    type: Date
  },
  rentalFee: {
    type: Number
  }
});

rentalSchema.statics.lookup = function(customerId, mangaId) {
  return this.findOne({
    "customer._id": customerId,
    "manga._id": mangaId
  });
};

rentalSchema.methods.return = function() {
  this.dateReturned = new Date();

  const rentalDays = moment().diff(this.dateOut, "days");
  this.rentalFee = rentalDays * this.manga.dailyRentalRate;
};

const Rental = mongoose.model("Rental", rentalSchema);

function validateRental(rental) {
  const schema = {
    customerId: Joi.objectId().required(),
    mangaId: Joi.objectId().required()
  };

  return Joi.validate(rental, schema);
}

module.exports.validate = validateRental;
module.exports.Rental = Rental;
