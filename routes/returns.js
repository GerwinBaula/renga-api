const Joi = require("joi");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const { Manga } = require("../models/manga");
const { Rental } = require("../models/rental");
const express = require("express");
const router = express.Router();

router.post("/", [auth, validate(validateReturn)], async (req, res) => {
  const rental = await Rental.lookup(req.body.customerId, req.body.mangaId);
  if (!rental) return res.status(404).send("Rental not found.");

  if (rental.dateReturned)
    return res.status(400).send("Manga already returned.");

  rental.return();
  await rental.save();

  const manga = await Manga.findById(req.body.mangaId);
  manga.numberInStock++;
  await manga.save();

  res.send(rental);
});

function validateReturn(req) {
  const schema = {
    customerId: Joi.objectId().required(),
    mangaId: Joi.objectId().required()
  };

  return Joi.validate(req, schema);
}

module.exports = router;
