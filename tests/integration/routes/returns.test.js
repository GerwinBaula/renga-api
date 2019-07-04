const { Customer } = require("../../../models/customer");
const { Publisher } = require("../../../models/publisher");
const { Genre } = require("../../../models/genre");
const { Author } = require("../../../models/author");
const { Manga } = require("../../../models/manga");
const { Rental } = require("../../../models/rental");
const { User } = require("../../../models/user");
const moment = require("moment");
const request = require("supertest");

let server;

describe("/api/returns", () => {
  beforeEach(() => {
    server = require("../../../index");
  });
  afterEach(async () => {
    await Customer.deleteMany({});
    await Publisher.deleteMany({});
    await Genre.deleteMany({});
    await Author.deleteMany({});
    await Manga.deleteMany({});
    await Rental.deleteMany({});
    await User.deleteMany({});
    await server.close();
  });

  describe("POST /", () => {
    let token;
    let rtn;

    const exec = () => {
      return request(server)
        .post("/api/returns")
        .set("x-auth-token", token)
        .send(rtn);
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

      const sampleRental = {
        customer,
        manga
      };

      rental = new Rental(sampleRental);
      await rental.save();

      --manga.numberInStock;
      await manga.save();

      rtn = {
        customerId: customer._id,
        mangaId: manga._id
      };
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it("should return 400 if customerId is not provided", async () => {
      delete rtn.customerId;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if mangaId is not provided", async () => {
      delete rtn.mangaId;

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 404 no rental is found for this customer/movie", async () => {
      await Rental.deleteMany({});

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 400 if the rental is already returned", async () => {
      rental.dateReturned = new Date();
      await rental.save();

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 200 if its valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });

    it("should set the dateReturned if its valid", async () => {
      await exec();

      const found = await Rental.findOne({
        "customer._id": customer._id,
        "manga._id": manga._id
      });

      const diff = new Date() - found.dateReturned;

      expect(diff).toBeLessThan(5 * 1000);
    });

    it("should calculate and set the rentalFee", async () => {
      rental.dateOut = moment()
        .add(-2, "days")
        .toDate();
      await rental.save();

      await exec();

      const found = await Rental.findOne({
        "customer._id": customer._id,
        "manga._id": manga._id
      });

      expect(found.rentalFee).toBe(20);
    });

    it("should increment the stock of the manga", async () => {
      await exec();

      const found = await Manga.findOne({ _id: manga._id });

      expect(found.numberInStock).toBe(10);
    });

    it("should return the rental if its valid", async () => {
      const res = await exec();

      expect(Object.keys(res.body)).toEqual(
        expect.arrayContaining([
          "dateOut",
          "dateReturned",
          "rentalFee",
          "customer",
          "manga"
        ])
      );
    });
  });
});
