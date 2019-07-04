const request = require("supertest");
const { User } = require("../../../models/user");
const { Manga } = require("../../../models/manga");
const { Author } = require("../../../models/author");
const { Genre } = require("../../../models/genre");
const { Publisher } = require("../../../models/publisher");
const mongoose = require("mongoose");

let server;

describe("/api/mangas", () => {
  beforeEach(() => {
    server = require("../../../index");
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Author.deleteMany({});
    await Genre.deleteMany({});
    await Publisher.deleteMany({});
    await Manga.deleteMany({});
    await server.close();
  });

  describe("GET /", () => {
    it("should return all mangas", async () => {
      const firstAuthorId = new mongoose.Types.ObjectId();
      const secondAuthorId = new mongoose.Types.ObjectId();

      const firstGenreId = new mongoose.Types.ObjectId();
      const secondGenreId = new mongoose.Types.ObjectId();

      const firstPublisherId = new mongoose.Types.ObjectId();
      const secondPublisherId = new mongoose.Types.ObjectId();

      await Author.insertMany([
        {
          _id: firstAuthorId,
          firstName: "sampleFirstName",
          lastName: "sampleLastName",
          email: "sampleEmail@gmail.com"
        },
        {
          _id: secondAuthorId,
          firstName: "sampleFirstName2",
          lastName: "sampleLastName2",
          email: "sampleEmail2@gmail.com"
        }
      ]);

      await Genre.insertMany([
        { _id: firstGenreId, genre: "genre1" },
        { _id: secondGenreId, genre: "genre2" }
      ]);

      await Publisher.insertMany([
        {
          _id: firstPublisherId,
          name: "sampleName",
          website: "sampleWebsite.com"
        },
        {
          _id: secondPublisherId,
          name: "sampleName2",
          website: "sampleWebsite2.com"
        }
      ]);

      const firstAuthor = await Author.findById(firstAuthorId);
      const firstGenre = await Genre.findById(firstGenreId);
      const firstPublisher = await Publisher.findById(firstPublisherId);

      const secondAuthor = await Author.findById(secondAuthorId);
      const secondGenre = await Genre.findById(secondGenreId);
      const secondPublisher = await Publisher.findById(secondPublisherId);

      await Manga.insertMany([
        {
          title: "sampleTitle",
          author: firstAuthor,
          genre: firstGenre,
          publisher: firstPublisher,
          numberInStock: 10,
          dailyRentalRate: 10
        },
        {
          title: "sampleTitle2",
          author: secondAuthor,
          genre: secondGenre,
          publisher: secondPublisher,
          numberInStock: 10,
          dailyRentalRate: 10
        }
      ]);

      const res = await request(server).get("/api/mangas");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(m => m.title === "sampleTitle")).toBeTruthy();
      expect(res.body.some(m => m.title === "sampleTitle2")).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return 400 if the id is not valid", async () => {
      const res = await request(server).get("/api/mangas/1");

      expect(res.status).toBe(400);
    });

    it("should return 404 if the id is not found", async () => {
      const validObjectId = new mongoose.Types.ObjectId();
      const res = await request(server).get("/api/mangas/" + validObjectId);

      expect(res.status).toBe(404);
    });

    it("should return 200 if the id is valid and found", async () => {
      const authorId = new mongoose.Types.ObjectId().toHexString();
      const genreId = new mongoose.Types.ObjectId().toHexString();
      const publisherId = new mongoose.Types.ObjectId().toHexString();

      const sampleAuthor = {
        _id: authorId,
        firstName: "sampleFirstName",
        lastName: "sampleLastName",
        email: "sampleEmail@gmail.com"
      };

      const sampleGenre = {
        _id: genreId,
        genre: "genre1"
      };

      const samplePublisher = {
        _id: publisherId,
        name: "sampleName",
        website: "sampleWebsite.com"
      };

      const author = new Author(sampleAuthor);
      const genre = new Genre(sampleGenre);
      const publisher = new Publisher(samplePublisher);

      await author.save();
      await genre.save();
      await publisher.save();

      const sampleManga = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        title: "sampleTitle",
        author: {
          _id: authorId,
          firstName: author.firstName,
          lastName: author.lastName,
          email: author.email
        },
        genre: {
          _id: genreId,
          genre: genre.genre
        },
        publisher: {
          _id: publisherId,
          name: publisher.name,
          website: publisher.website
        },
        numberInStock: 10,
        dailyRentalRate: 10
      };

      const manga = new Manga(sampleManga);
      await manga.save();

      const res = await request(server).get("/api/mangas/" + manga._id);

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(sampleManga);
      expect(res.body).toHaveProperty("title", sampleManga.title);

      expect(res.body).toHaveProperty("author", sampleManga.author);
      expect(res.body.author).toHaveProperty(
        "firstName",
        sampleManga.author.firstName
      );
      expect(res.body.author).toHaveProperty(
        "lastName",
        sampleManga.author.lastName
      );
      expect(res.body.author).toHaveProperty("email", sampleManga.author.email);

      expect(res.body).toHaveProperty("genre", sampleManga.genre);
      expect(res.body.genre).toHaveProperty("genre", sampleManga.genre.genre);

      expect(res.body).toHaveProperty("publisher", sampleManga.publisher);
      expect(res.body.publisher).toHaveProperty(
        "name",
        sampleManga.publisher.name
      );
      expect(res.body.publisher).toHaveProperty(
        "website",
        sampleManga.publisher.website
      );

      expect(res.body).toHaveProperty(
        "numberInStock",
        sampleManga.numberInStock
      );
      expect(res.body).toHaveProperty(
        "dailyRentalRate",
        sampleManga.dailyRentalRate
      );
    });
  });

  describe("POST /", () => {
    let token;
    let manga;

    let author;
    let genre;
    let publisher;

    const exec = () => {
      return request(server)
        .post("/api/mangas")
        .set("x-auth-token", token)
        .send(manga);
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();

      const sampleAuthor = {
        firstName: "sampleFirstName",
        lastName: "sampleLastName",
        email: "sampleEmail@gmail.com"
      };

      author = new Author(sampleAuthor);
      await author.save();

      const sampleGenre = {
        genre: "genre1"
      };

      genre = new Genre(sampleGenre);
      await genre.save();

      const samplePublisher = {
        name: "sampleName",
        website: "sampleWebsite.com"
      };

      publisher = new Publisher(samplePublisher);
      await publisher.save();

      manga = {
        title: "sampleTitle",
        authorId: author._id,
        genreId: genre._id,
        publisherId: publisher._id,
        numberInStock: 10,
        dailyRentalRate: 20
      };
    });

    it("should return status 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if the title is less than 2 characters", async () => {
      manga.title = "s";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the title is more than 50 characters", async () => {
      manga.title = new Array(52).join("t");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the authorId is not valid", async () => {
      manga.authorId = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the authorId is valid but not found", async () => {
      const validObjectId = new mongoose.Types.ObjectId();
      manga.authorId = validObjectId;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the genreId is not valid", async () => {
      manga.genreId = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the genreId is valid but not found", async () => {
      const validObjectId = new mongoose.Types.ObjectId();
      manga.genreId = validObjectId;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the publisherId is not valid", async () => {
      manga.publisherId = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the publisherId is valid but not found", async () => {
      const validObjectId = new mongoose.Types.ObjectId();
      manga.publisherId = validObjectId;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the numberInStock is less than 0", async () => {
      manga.numberInStock = -1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the numberInStock is more than 255", async () => {
      manga.numberInStock = 256;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the dailyRentalRate is less than 0", async () => {
      manga.dailyRentalRate = -1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the dailyRentalRate is more than 255", async () => {
      manga.dailyRentalRate = 256;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the manga if its valid", async () => {
      await exec();

      const found = await Manga.findOne({ title: "sampleTitle" });

      expect(found).not.toHaveProperty("authorId");
      expect(found).not.toHaveProperty("genreId");
      expect(found).not.toHaveProperty("publisherId");
      expect(found).toHaveProperty("author");
      expect(found).toHaveProperty("genre");
      expect(found).toHaveProperty("publisher");
      expect(found).not.toBeNull();
    });

    it("should return status of 200 and the manga if its valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toMatchObject({
        title: "sampleTitle",
        numberInStock: 10,
        dailyRentalRate: 20
      });
      expect(res.body).toHaveProperty("author");
      expect(res.body.author).toMatchObject({
        firstName: "sampleFirstName",
        lastName: "sampleLastName",
        email: "sampleEmail@gmail.com"
      });
      expect(res.body).toHaveProperty("genre");
      expect(res.body.genre).toMatchObject({ genre: "genre1" });
      expect(res.body).toHaveProperty("publisher");
      expect(res.body.publisher).toMatchObject({
        name: "sampleName",
        website: "sampleWebsite.com"
      });
    });
  });
});
