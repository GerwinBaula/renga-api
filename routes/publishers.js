const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const { Publisher, validate } = require("../models/publisher");
const express = require("express");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const publisher = new Publisher({
    name: req.body.name,
    website: req.body.website
  });
  await publisher.save();

  res.send(publisher);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const publisher = await Publisher.findById(req.params.id);
  if (!publisher)
    return res.status(404).send("Publisher with given id is not found.");

  res.send(publisher);
});

router.put("/:id", [auth, validateObjectId], async (req, res) => {
  const publisher = await Publisher.findById(req.params.id);
  if (!publisher)
    return res.status(404).send("Publisher with the given id is not found.");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  publisher.set({
    name: req.body.name,
    website: req.body.website
  });
  await publisher.save();

  res.send(publisher);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  let publisher = await Publisher.findById(req.params.id);
  if (!publisher)
    return res.status(404).send("Publisher with given id is not found.");

  publisher = await Publisher.findByIdAndDelete(req.params.id);
  res.send(publisher);
});

router.get("/", async (req, res) => {
  const publishers = await Publisher.find().sort("name");
  res.send(publishers);
});

module.exports = router;
