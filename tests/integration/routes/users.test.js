const request = require("supertest");
const { User } = require("../../../models/user");

let server;

describe("/api/users", () => {
  beforeEach(() => {
    server = require("../../../index");
  });
  afterEach(async () => {
    await User.deleteMany({});
    await server.close();
  });

  describe("GET /me", () => {
    it("should return all user that are logged in", async () => {
      const sampleUser = {
        firstName: "sampleFirstName",
        lastName: "sampleLastName",
        email: "sampleEmail@gmail.com",
        password: "samplePassword"
      };

      const user = new User(sampleUser);
      await user.save();

      const token = user.generateAuthToken();

      const res = await request(server)
        .get("/api/users/me")
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("firstName", sampleUser.firstName);
      expect(res.body).toHaveProperty("lastName", sampleUser.lastName);
      expect(res.body).toHaveProperty("email", sampleUser.email);
    });
  });

  describe("POST /", () => {
    let user;

    const exec = () => {
      return request(server)
        .post("/api/users")
        .send(user);
    };

    beforeEach(() => {
      user = {
        firstName: "sampleFirstName",
        lastName: "sampleLastName",
        email: "sampleEmail@gmail.com",
        password: "samplePassword"
      };
    });

    it("should return 400 if the firstName is less than 2", async () => {
      user.firstName = "f";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the firstName is more than 50", async () => {
      user.firstName = new Array(52).join("f");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the lastName is less than 2", async () => {
      user.lastName = "l";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the lastName is more than 50", async () => {
      user.lastName = new Array(52).join("l");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the email is less than 2", async () => {
      user.email = "e";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the email is more than 50", async () => {
      user.email = new Array(52).join("e");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the password is less than 3", async () => {
      let res;

      const lessThanThree = ["p", "pp"];

      for (let element of lessThanThree) {
        user.password = element;

        res = await exec();
        expect(res.status).toBe(400);
      }
    });

    it("should return 400 if the email is already registered", async () => {
      const sampleUser = {
        firstName: "sampleFirstName",
        lastName: "sampleLastName",
        email: "sampleEmail@gmail.com",
        password: "samplePassword"
      };

      await User.insertMany([sampleUser]);

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should hash the password before saving it to database", async () => {
      await exec();

      const found = await User.findOne({ firstName: "sampleFirstName" });

      expect(found.password).not.toBe(user.password);
    });

    it("should save the user if its valid", async () => {
      await exec();

      const found = await User.findOne({ firstName: "sampleFirstName" });

      expect(found).not.toBeNull();
    });

    it("should return status of 200, set a token for header, and the user if its valid", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res.header).not.toBeNull();
      expect(res.body).toMatchObject({
        firstName: "sampleFirstName",
        lastName: "sampleLastName",
        email: "sampleEmail@gmail.com"
      });
    });
  });
});
