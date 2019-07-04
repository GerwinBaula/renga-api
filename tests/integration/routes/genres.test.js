const request = require("supertest");
const { User } = require("../../../models/user");
const { Genre } = require("../../../models/genre");
const mongoose = require("mongoose");

let server;

describe("/api/genres", () => {
  beforeEach(() => {
    server = require("../../../index");
  });
  afterEach(async () => {
    await Genre.deleteMany({});
    await User.deleteMany({});
    await server.close();
  });

  describe("GET /", () => {
    it("should return all genres", async () => {
      await Genre.insertMany([{ genre: "genre1" }, { genre: "genre2" }]);

      const res = await request(server).get("/api/genres");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(g => g.genre === "genre1")).toBeTruthy();
      expect(res.body.some(g => g.genre === "genre2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return 400 if genre id is not valid", async () => {
      const res = await request(server).get("/api/genres/1");

      expect(res.status).toBe(400);
    });

    it("should return 404 if genre id is not found", async () => {
      const res = await request(server).get(
        "/api/genres/" + new mongoose.Types.ObjectId()
      );

      expect(res.status).toBe(404);
    });

    it("should return status of 200 if genre id is valid and found", async () => {
      const sampleGenre = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        genre: "genre1"
      };

      const genre = new Genre(sampleGenre);
      await genre.save();

      const res = await request(server).get("/api/genres/" + sampleGenre._id);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(sampleGenre);
      expect(res.body).toHaveProperty("_id", sampleGenre._id);
      expect(res.body).toHaveProperty("genre", sampleGenre.genre);
    });
  });

  describe("POST /", () => {
    let token;
    let genre;

    const exec = () => {
      return request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send(genre);
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      genre = { genre: "genre1" };
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if genre is less than 2 characters", async () => {
      genre.genre = "a";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is more than 50 characters", async () => {
      genre.genre = new Array(52).join("g");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the genre if its valid", async () => {
      await exec();

      const genre = await Genre.findOne({ genre: "genre1" });

      expect(genre).not.toBeNull();
    });

    it("should return status of 200 and the genre if it's valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toMatchObject(genre);
    });
  });
});
