const request = require("supertest");
const { User } = require("../../../models/user");
const { Manga } = require("../../../models/manga");
const { Publisher } = require("../../../models/publisher");
const { Genre } = require("../../../models/genre");
const { Author } = require("../../../models/author");
const { Customer } = require("../../../models/customer");
const { Rental } = require("../../../models/rental");
const mongoose = require("mongoose");

let server;

describe("/api/rentals", () => {
  beforeEach(() => {
    server = require("../../../index");
  });

  afterEach(async () => {
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Manga.deleteMany({});
    await Publisher.deleteMany({});
    await Genre.deleteMany({});
    await Author.deleteMany({});
    await Rental.deleteMany({});
    await server.close();
  });

  describe("GET /", () => {
    it("should return all rentals", async () => {
      const firstCustomerId = new mongoose.Types.ObjectId();
      const secondCustomerId = new mongoose.Types.ObjectId();

      const firstAuthorId = new mongoose.Types.ObjectId();
      const secondAuthorId = new mongoose.Types.ObjectId();

      const firstGenreId = new mongoose.Types.ObjectId();
      const secondGenreId = new mongoose.Types.ObjectId();

      const firstPublisherId = new mongoose.Types.ObjectId();
      const secondPublisherId = new mongoose.Types.ObjectId();

      const firstMangaId = new mongoose.Types.ObjectId();
      const secondMangaId = new mongoose.Types.ObjectId();

      const firstRentalId = new mongoose.Types.ObjectId();
      const secondRentalId = new mongoose.Types.ObjectId();

      await Customer.insertMany([
        {
          _id: firstCustomerId,
          firstName: "sampleFirstName",
          lastName: "sampleLastName",
          isGold: true,
          phone: "1234"
        },
        {
          _id: secondCustomerId,
          firstName: "sampleFirstName2",
          lastName: "sampleLastName2",
          isGold: true,
          phone: "5678"
        }
      ]);
      const firstCustomer = await Customer.findById(firstCustomerId);
      const secondCustomer = await Customer.findById(secondCustomerId);

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

      const firstAuthor = await Author.findById(firstAuthorId);
      const secondAuthor = await Author.findById(secondAuthorId);

      await Genre.insertMany([
        { _id: firstGenreId, genre: "genre1" },
        { _id: secondGenreId, genre: "genre2" }
      ]);

      const firstGenre = await Genre.findById(firstGenreId);
      const secondGenre = await Genre.findById(secondGenreId);

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

      const firstPublisher = await Publisher.findById(firstPublisherId);
      const secondPublisher = await Publisher.findById(secondPublisherId);

      await Manga.insertMany([
        {
          _id: firstMangaId,
          title: "sampleTitle",
          author: firstAuthor,
          genre: firstGenre,
          publisher: firstPublisher,
          numberInStock: 10,
          dailyRentalRate: 10
        },
        {
          _id: secondMangaId,
          title: "sampleTitle2",
          author: secondAuthor,
          genre: secondGenre,
          publisher: secondPublisher,
          numberInStock: 10,
          dailyRentalRate: 10
        }
      ]);

      const firstManga = await Manga.findById(firstMangaId);
      const secondManga = await Manga.findById(secondMangaId);

      await Rental.insertMany([
        {
          _id: firstRentalId,
          customer: {
            _id: firstCustomerId,
            firstName: firstCustomer.firstName,
            lastName: firstCustomer.lastName,
            isGold: firstCustomer.isGold,
            phone: firstCustomer.phone
          },
          manga: {
            _id: firstMangaId,
            title: firstManga.title,
            author: firstManga.author,
            genre: firstManga.genre,
            publisher: firstManga.publisher,
            numberInStock: firstManga.numberInStock,
            dailyRentalRate: firstManga.dailyRentalRate
          },
          dateOut: new Date(),
          rentalFee: 10
        },
        {
          _id: secondRentalId,
          customer: {
            _id: secondCustomerId,
            firstName: secondCustomer.firstName,
            lastName: secondCustomer.lastName,
            isGold: secondCustomer.isGold,
            phone: secondCustomer.phone
          },
          manga: {
            _id: secondMangaId,
            title: secondManga.title,
            author: secondManga.author,
            genre: secondManga.genre,
            publisher: secondManga.publisher,
            numberInStock: secondManga.numberInStock,
            dailyRentalRate: secondManga.dailyRentalRate
          },
          dateOut: new Date(),
          rentalFee: 20
        }
      ]);

      const res = await request(server).get("/api/rentals");

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body.some(r => r.rentalFee === 10)).toBeTruthy();
      expect(res.body.some(r => r.rentalFee === 20)).toBeTruthy();
    });
  });

  describe("GET /:id", () => {
    it("should return 400 if id is not valid", async () => {
      const res = await request(server).get("/api/rentals/1");

      expect(res.status).toBe(400);
    });

    it("should return 404 if id is not found", async () => {
      const validObjectId = new mongoose.Types.ObjectId();
      const res = await request(server).get("/api/rentals/" + validObjectId);

      expect(res.status).toBe(404);
    });

    it("should return 200 if id is valid and found", async () => {
      const customerId = new mongoose.Types.ObjectId();
      const authorId = new mongoose.Types.ObjectId();
      const genreId = new mongoose.Types.ObjectId();
      const publisherId = new mongoose.Types.ObjectId();
      const mangaId = new mongoose.Types.ObjectId();
      const rentalId = new mongoose.Types.ObjectId();

      const sampleCustomer = {
        _id: customerId,
        firstName: "sampleFirstName",
        lastName: "sampleLastName",
        isGold: true,
        phone: "1234"
      };

      const customer = new Customer(sampleCustomer);
      await customer.save();

      const sampleAuthor = {
        _id: authorId,
        firstName: "sampleFirstName",
        lastName: "sampleLastName",
        email: "sampleEmail@gmail.com"
      };

      const author = new Author(sampleAuthor);
      await author.save();

      const sampleGenre = {
        _id: genreId,
        genre: "genre1"
      };

      const genre = new Genre(sampleGenre);
      await genre.save();

      const samplePublisher = {
        _id: publisherId,
        name: "sampleName",
        website: "sampleWebsite.com"
      };

      const publisher = new Publisher(samplePublisher);
      await publisher.save();

      const sampleManga = {
        _id: mangaId,
        title: "sampleTitle",
        author: author,
        genre: genre,
        publisher: publisher,
        numberInStock: 10,
        dailyRentalRate: 10
      };

      const manga = new Manga(sampleManga);
      await manga.save();

      const sampleRental = {
        _id: rentalId,
        customer: {
          _id: customerId,
          firstName: customer.firstName,
          lastName: customer.lastName,
          isGold: customer.isGold,
          phone: customer.phone
        },
        manga: {
          _id: mangaId,
          title: manga.title,
          author: manga.author,
          genre: manga.genre,
          publisher: manga.publisher,
          numberInStock: manga.numberInStock,
          dailyRentalRate: manga.dailyRentalRate
        },
        dateOut: new Date("June 15 2019 21:09"),
        rentalFee: 10
      };

      const rental = new Rental(sampleRental);
      await rental.save();

      const res = await request(server).get("/api/rentals/" + rental._id);

      expect(res.status).toBe(200);
    });
  });

  describe("POST /", () => {
    let token;
    let rental;

    let customer;
    let author;
    let genre;
    let publisher;
    let manga;
    let mangaOutOfStock;

    const exec = () => {
      return request(server)
        .post("/api/rentals")
        .set("x-auth-token", token)
        .send(rental);
    };

    beforeEach(async () => {
      token = new User().generateAuthToken();

      const sampleCustomer = {
        firstName: "sampleFirstName",
        lastName: "sampleLastName",
        isGold: true,
        phone: "1234"
      };

      customer = new Customer(sampleCustomer);
      await customer.save();

      const sampleAuthor = {
        firstName: "sampleFirstName",
        lastName: "sampleLastName",
        email: "sampleEmail@gmail.com"
      };

      const sampleGenre = {
        genre: "genre1"
      };

      const samplePublisher = {
        name: "sampleName",
        website: "sampleWebsite.com"
      };

      author = new Author(sampleAuthor);
      genre = new Genre(sampleGenre);
      publisher = new Publisher(samplePublisher);

      await author.save();
      await genre.save();
      await publisher.save();

      const sampleManga = {
        title: "sampleTitle",
        author: {
          firstName: author.firstName,
          lastName: author.lastName,
          email: author.email
        },
        genre: {
          genre: genre.genre
        },
        publisher: {
          name: publisher.name,
          website: publisher.website
        },
        numberInStock: 10,
        dailyRentalRate: 10
      };

      manga = new Manga(sampleManga);
      await manga.save();

      rental = {
        customerId: customer._id,
        mangaId: manga._id
      };
    });

    it("should return 401 if the client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if the customerId is not valid", async () => {
      rental.customerId = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the customerId is valid but not found", async () => {
      const validObjectId = new mongoose.Types.ObjectId();
      rental.customerId = validObjectId;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the mangaId is not valid", async () => {
      rental.mangaId = 1;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the mangaId is valid but not found", async () => {
      const validObjectId = new mongoose.Types.ObjectId();
      rental.mangaId = validObjectId;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if manga is out of stock", async () => {
      const sampleMangaOutOfStock = {
        title: "sampleTitle",
        author: {
          firstName: author.firstName,
          lastName: author.lastName,
          email: "sampleEmailForMangaOutOfStock@gmail.com"
        },
        genre: {
          genre: genre.genre
        },
        publisher: {
          name: publisher.name,
          website: publisher.website
        },
        numberInStock: 0,
        dailyRentalRate: 10
      };

      mangaOutOfStock = new Manga(sampleMangaOutOfStock);
      await mangaOutOfStock.save();

      rental.mangaId = mangaOutOfStock._id;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should save the rental if its valid", async () => {
      await exec();

      const found = await Rental.findOne({ customer });

      expect(found).not.toBeNull();
    });

    it("should decrement the manga's number of stock if the rental is valid", async () => {
      await exec();

      const found = await Manga.findOne({ title: "sampleTitle" });

      expect(found.numberInStock).toBe(--manga.numberInStock);
    });

    it("should save the manga after decrementing its numberInStock", async () => {
      await exec();

      const found = await Manga.findOne({ title: "sampleTitle" });

      expect(found).not.toBeNull();
      expect(found).toHaveProperty("numberInStock", --manga.numberInStock);
    });

    it("should return status of 200 and the rental if its valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("customer");
      expect(res.body).toHaveProperty("manga");
    });
  });
});
