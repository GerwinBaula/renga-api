const request = require("supertest");
const { User } = require("../../../models/user");
const { Customer } = require("../../../models/customer");
const mongoose = require("mongoose");

let server;

describe("/api/customers", () => {
  beforeEach(() => {
    server = require("../../../index");
  });
  afterEach(async () => {
    await Customer.deleteMany({});
    await User.deleteMany({});
    await server.close();
  });

  describe("GET /", () => {
    it("should return all customers", async () => {
      await Customer.insertMany([
        {
          firstName: "sampleFirstName",
          lastName: "sampleLastName",
          isGold: true,
          phone: "1234"
        },
        {
          firstName: "sampleFirstName2",
          lastName: "sampleLastName2",
          isGold: true,
          phone: "5678"
        }
      ]);

      const res = await request(server).get("/api/customers");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(c => c.phone === "1234")).toBeTruthy();
      expect(res.body.some(c => c.phone === "5678")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return 400 if the id is not valid", async () => {
      const res = await request(server).get("/api/customers/1");

      expect(res.status).toBe(400);
    });

    it("should return 404 if the id is not found", async () => {
      const validObjectId = new mongoose.Types.ObjectId();
      const res = await request(server).get("/api/customers/" + validObjectId);

      expect(res.status).toBe(404);
    });

    it("should return 200 if the id is valid and found", async () => {
      const sampleCustomer = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        firstName: "sampleFirstName",
        lastName: "sampleLastName",
        isGold: true,
        phone: "1234"
      };

      const customer = new Customer(sampleCustomer);
      await customer.save();

      const res = await request(server).get(
        "/api/customers/" + sampleCustomer._id
      );

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(sampleCustomer);
      expect(res.body).toHaveProperty("firstName", sampleCustomer.firstName);
      expect(res.body).toHaveProperty("lastName", sampleCustomer.lastName);
      expect(res.body).toHaveProperty("isGold", sampleCustomer.isGold);
      expect(res.body).toHaveProperty("phone", sampleCustomer.phone);
    });
  });

  describe("POST /", () => {
    let token;
    let customer;

    const exec = () => {
      return request(server)
        .post("/api/customers")
        .set("x-auth-token", token)
        .send(customer);
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      customer = {
        firstName: "sampleFirstName",
        lastName: "sampleLastName",
        isGold: true,
        phone: "1234"
      };
    });

    it("should return 401 if the client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if the firstName is less than 2 characters", async () => {
      customer.firstName = "f";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the firstName is more than 50 characters", async () => {
      customer.firstName = new Array(52).join("f");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the lastName is less than 2 characters", async () => {
      customer.lastName = "l";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the lastName is more than 50 characters", async () => {
      customer.lastName = new Array(52).join("l");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if isGold is a string", async () => {
      customer.isGold = "test";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if isGold is a number", async () => {
      customer.isGold = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if isGold is null", async () => {
      customer.isGold = null;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the phone is less than 2 characters", async () => {
      customer.phone = "l";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the phone is more than 50 characters", async () => {
      customer.phone = new Array(52).join("l");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the customer if its valid", async () => {
      await exec();

      const customer = await Customer.findOne({ firstName: "sampleFirstName" });

      expect(customer).not.toBeNull();
    });

    it("should return status of 200 and the customer if its valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(customer);
      expect(res.body).toHaveProperty("_id");
    });
  });
});
