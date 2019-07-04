const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const { Genre, validate } = require("../models/genre");
const express = require("express");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = new Genre({
    genre: req.body.genre
  });
  await genre.save();

  res.send(genre);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send("Genre with given id is not found.");

  res.send(genre);
});

router.put("/:id", auth, async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send("Genre with given id is not found.");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  genre.set({
    genre: req.body.genre
  });
  await genre.save();

  res.send(genre);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  let genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send("Genre with given id is not found.");

  genre = await Genre.findByIdAndDelete(req.params.id);
  res.send(genre);
});

router.get("/", async (req, res) => {
  const genres = await Genre.find().sort("genre");
  res.send(genres);
});

module.exports = router;
