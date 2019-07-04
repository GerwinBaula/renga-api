const request = require("supertest");
const { User } = require("../../../models/user");
const { Author } = require("../../../models/author");
const mongoose = require("mongoose");

let server;

describe("/api/authors", () => {
  beforeEach(() => {
    server = require("../../../index");
  });
  afterEach(async () => {
    await Author.deleteMany({});
    await User.deleteMany({});
    await server.close();
  });

  describe("GET /", () => {
    it("should return all authors", async () => {
      await Author.insertMany([
        {
          firstName: "sampleFirstName",
          lastName: "sampleLastName",
          email: "sampleEmail@gmail.com"
        },
        {
          firstName: "sampleFirstName2",
          lastName: "sampleLastName2",
          email: "sampleEmail2@gmail.com"
        }
      ]);

      const res = await request(server).get("/api/authors");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(
        res.body.some(a => a.firstName === "sampleFirstName")
      ).toBeTruthy();
      expect(
        res.body.some(a => a.firstName === "sampleFirstName2")
      ).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return 400 if the author id is not valid", async () => {
      const res = await request(server).get("/api/authors/1");

      expect(res.status).toBe(400);
    });

    it("should return 404 if the author id is not found", async () => {
      const validObjectId = new mongoose.Types.ObjectId();
      const res = await request(server).get("/api/authors/" + validObjectId);

      expect(res.status).toBe(404);
    });

    it("should return 200 if the author id is valid and found", async () => {
      const sampleAuthor = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        firstName: "sampleFirstName",
        lastName: "sampleLastName",
        email: "sampleEmail@gmail.com"
      };

      const author = new Author(sampleAuthor);
      await author.save();

      const res = await request(server).get("/api/authors/" + sampleAuthor._id);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(sampleAuthor);
      expect(res.body).toHaveProperty("firstName", sampleAuthor.firstName);
      expect(res.body).toHaveProperty("lastName", sampleAuthor.lastName);
      expect(res.body).toHaveProperty("email", sampleAuthor.email);
    });
  });

  describe("POST /", () => {
    let token;
    let author;

    const exec = () => {
      return request(server)
        .post("/api/authors")
        .set("x-auth-token", token)
        .send(author);
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      author = {
        firstName: "sampleFirstName",
        lastName: "sampleLastName",
        email: "sampleEmail@gmail.com"
      };
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if firstName is less than 2", async () => {
      author.firstName = "f";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if firstName is more than 50", async () => {
      author.firstName = new Array(52).join("f");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if lastName is less than 2", async () => {
      author.lastName = "l";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if lastName is more than 50", async () => {
      author.lastName = new Array(52).join("l");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if email is less than 2", async () => {
      author.email = "e";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if email is more than 50", async () => {
      author.email = new Array(52).join("e");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the author if its valid", async () => {
      await exec();

      const author = await Author.findOne({ firstName: "sampleFirstName" });

      expect(author).not.toBeNull();
    });

    it("should return status of 200 and the author if its valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(author);
      expect(res.body).toHaveProperty("_id");
    });
  });
});
