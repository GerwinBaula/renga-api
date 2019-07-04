const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const { Publisher } = require("../models/publisher");
const { Genre } = require("../models/genre");
const { Author } = require("../models/author");
const { Manga, validate } = require("../models/manga");
const express = require("express");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const author = await Author.findById(req.body.authorId);
  if (!author) return res.status(400).send("Invalid author.");

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre.");

  const publisher = await Publisher.findById(req.body.publisherId);
  if (!publisher) return res.status(400).send("Invalid publisher.");

  const manga = new Manga({
    title: req.body.title,
    author: {
      _id: author._id,
      firstName: author.firstName,
      lastName: author.lastName,
      email: author.email
    },
    genre: {
      _id: genre._id,
      genre: genre.genre
    },
    publisher: {
      _id: publisher._id,
      name: publisher.name,
      website: publisher.website
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate
  });

  await manga.save();

  res.send(manga);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const manga = await Manga.findById(req.params.id);
  if (!manga)
    return res.status(404).send("Manga with the given id is not found.");

  res.send(manga);
});

router.put("/:id", [auth, validateObjectId], async (req, res) => {
  const manga = await Manga.findById(req.params.id);
  if (!manga)
    return res.status(404).send("Manga with the given id is not found.");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const author = await Author.findById(req.body.authorId);
  if (!author) return res.status(400).send("Invalid author.");

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre.");

  const publisher = await Publisher.findById(req.body.publisherId);
  if (!publisher) return res.status(400).send("Invalid publisher.");

  manga.set({
    title: req.body.title,
    author,
    genre,
    publisher,
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate
  });
  await manga.save();

  res.send(manga);
});

router.delete("/:id", [auth, admin], async (req, res) => {
  let manga = await Manga.findById(req.params.id);
  if (!manga)
    return res.status(404).send("Manga with the given id is not found.");

  manga = await Manga.findByIdAndDelete(req.params.id);

  res.send(manga);
});

router.get("/", async (req, res) => {
  const mangas = await Manga.find().sort("title");
  res.send(mangas);
});

module.exports = router;
