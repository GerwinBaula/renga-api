const { User } = require("../../../models/user");
const { Publisher } = require("../../../models/publisher");
const request = require("supertest");
const mongoose = require("mongoose");

let server;

describe("/api/publishers", () => {
  beforeEach(() => {
    server = require("../../../index");
  });
  afterEach(async () => {
    await Publisher.deleteMany({});
    await User.deleteMany({});
    await server.close();
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      await Publisher.insertMany([
        { name: "sampleName", website: "sampleWebsite.com" },
        { name: "sampleName2", website: "sampleWebsite2.com" }
      ]);

      const res = await request(server).get("/api/publishers");

      expect(res.status).toBe(200);
    });
  });

  describe("GET /:id", () => {
    it("should return 400 if id is not valid", async () => {
      const res = await request(server).get("/api/publishers/1");

      expect(res.status).toBe(400);
    });

    it("should return 404 if id is not found", async () => {
      const validObjectId = new mongoose.Types.ObjectId();
      const res = await request(server).get("/api/publishers/" + validObjectId);

      expect(res.status).toBe(404);
    });

    it("should return 200 if id is valid and found", async () => {
      const samplePublisher = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        name: "sampleName",
        website: "sampleWebsite.com"
      };

      const publisher = new Publisher(samplePublisher);
      await publisher.save();

      const res = await request(server).get(
        "/api/publishers/" + samplePublisher._id
      );

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(samplePublisher);
      expect(res.body).toHaveProperty("name", samplePublisher.name);
      expect(res.body).toHaveProperty("website", samplePublisher.website);
    });
  });

  describe("POST /", () => {
    let token;
    let publisher;

    const exec = () => {
      return request(server)
        .post("/api/publishers")
        .set("x-auth-token", token)
        .send(publisher);
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      publisher = {
        name: "sampleName",
        website: "sampleWebsite.com"
      };
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if name is less than 2 characters", async () => {
      publisher.name = "n";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if name is more than 50 characters", async () => {
      publisher.name = new Array(52).join("n");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if website is less than 2 characters", async () => {
      publisher.website = "w";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if website is more than 50 characters", async () => {
      publisher.website = new Array(52).join("w");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the publisher if its valid", async () => {
      await exec();

      const publisher = await Publisher.findOne({ name: "sampleName" });

      expect(publisher).not.toBeNull();
    });

    it("should return status of 200 and the publisher if its valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(publisher);
      expect(res.body).toHaveProperty("_id");
    });
  });
});
