const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const { Author, validate } = require("../models/author");
const express = require("express");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const author = new Author({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email
  });
  await author.save();

  res.send(author);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const author = await Author.findById(req.params.id);

  if (!author)
    return res.status(404).send("Author with the given id is not found.");
  res.send(author);
});

router.put("/:id", [auth, validateObjectId], async (req, res) => {
  const author = await Author.findById(req.params.id);
  if (!author)
    return res.status(404).send("Author with the given id is not found.");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  author.set({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email
  });
  await author.save();

  res.send(author);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  let author = await Author.findById(req.params.id);
  if (!author)
    return res.status(404).send("Author with the given id is not found");

  author = await Author.findByIdAndDelete(req.params.id);
  res.send(author);
});

router.get("/", async (req, res) => {
  const authors = await Author.find().sort("firstName");
  res.send(authors);
});

module.exports = router;
