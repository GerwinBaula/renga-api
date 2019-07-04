const bcrypt = require("bcrypt");
const request = require("supertest");
const { User } = require("../../../models/user");

let server;

describe("/api/auth", () => {
  beforeEach(() => {
    server = require("../../../index");
  });
  afterEach(async () => {
    await User.deleteMany({});
    await server.close();
  });

  describe("POST /", () => {
    let registeredUser;
    let user;

    const exec = () => {
      return request(server)
        .post("/api/auth")
        .send(user);
    };

    beforeEach(async () => {
      const sampleUser = {
        firstName: "sampleFirstName",
        lastName: "sampleFirstName",
        email: "sampleEmail@gmail.com",
        password: "samplePassword"
      };

      registeredUser = new User(sampleUser);

      const salt = await bcrypt.genSalt(10);
      registeredUser.password = await bcrypt.hash(
        registeredUser.password,
        salt
      );

      await registeredUser.save();

      user = {
        email: "sampleEmail@gmail.com",
        password: "samplePassword"
      };
    });

    it("should populate the User", async () => {
      const found = await User.findById(registeredUser._id);

      expect(found).not.toBeNull();
    });

    it("should return 400 if the email is less than 2 characters", async () => {
      user.email = "e";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the email is less than 2 characters", async () => {
      user.email = new Array(52).join("e");

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 400 if the email is not yet registered", async () => {
      user.email = "sampleUnregisteredEmail@gmail.com";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return 403 if the password is invalid", async () => {
      user.password = "wrongPassword";

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it("should return status of 200 and send a token", async () => {
      const res = await exec();

      expect(res.status).toBe(200);
      expect(res).toHaveProperty("text");
    });
  });
});
