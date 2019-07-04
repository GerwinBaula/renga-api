const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const { Manga } = require("../models/manga");
const { Customer } = require("../models/customer");
const { Rental, validate } = require("../models/rental");
const express = require("express");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send("Invalid customerId");

  const manga = await Manga.findById(req.body.mangaId);
  if (!manga) return res.status(400).send("Invalid mangaId");

  if (!manga.numberInStock) return res.status(400).send("Out of stock.");

  const rental = new Rental({
    customer,
    manga: {
      _id: manga._id,
      title: manga.title,
      author: manga.author,
      genre: manga.genre,
      publisher: manga.publisher,
      dailyRentalRate: manga.dailyRentalRate
    }
  });

  await rental.save();

  --manga.numberInStock;
  manga.save();

  res.send(rental);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental)
    return res.status(404).send("Rental with given id is not found.");

  res.send(rental);
});

router.get("/", async (req, res) => {
  const rentals = await Rental.find().sort("-dateOut");
  res.send(rentals);
});

module.exports = router;
