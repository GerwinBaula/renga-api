const { User } = require("../../../models/user");
const { Genre } = require("../../../models/genre");
const request = require("supertest");

let server;

describe("auth middleware", () => {
  let token;
  let genre;

  const exec = () => {
    return request(server)
      .post("/api/genres")
      .set("x-auth-token", token)
      .send(genre);
  };

  beforeEach(() => {
    server = require("../../../index");
    token = new User().generateAuthToken();
    genre = {
      genre: "genre1"
    };
  });
  afterEach(async () => {
    await Genre.deleteMany({});
    await server.close();
  });

  it("should return 401 if the no token is provided.", async () => {
    token = "";

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it("should return 400 if token is not valid.", async () => {
    token = "wrongJwt";

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it("should return 200 if token is valid.", async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });
});
