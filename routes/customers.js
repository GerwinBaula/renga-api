const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const { Customer, validate } = require("../models/customer");
const express = require("express");
const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = new Customer({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    isGold: req.body.isGold,
    phone: req.body.phone
  });
  await customer.save();

  res.send(customer);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer)
    return res.status(404).send("Customer with the given id is not found.");

  res.send(customer);
});

router.put("/:id", [auth, validateObjectId], async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer)
    return res.status(404).send("Customer with the given id is not found.");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  customer.set({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    isGold: req.body.isGold,
    phone: req.body.phone
  });
  await customer.save();

  res.send(customer);
});

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  let customer = await Customer.findById(req.params.id);
  if (!customer)
    return res.status(404).send("Customer with the given id is not found.");

  customer = await Customer.findByIdAndDelete(req.params.id);
  res.send(customer);
});

router.get("/", async (req, res) => {
  const customers = await Customer.find().sort("firstName");
  res.send(customers);
});

module.exports = router;
