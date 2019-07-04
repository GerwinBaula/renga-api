const auth = require("../../../middleware/auth");
const mongoose = require("mongoose");
const { User } = require("../../../models/user");

describe("auth middleware", () => {
  it("should populate the req.user", () => {
    const payload = {
      _id: new mongoose.Types.ObjectId().toHexString(),
      isAdmin: true
    };

    const user = new User(payload);
    const token = user.generateAuthToken();

    const req = {
      header: jest.fn().mockReturnValue(token)
    };
    const res = {};
    const next = jest.fn();

    auth(req, res, next);

    expect(req.user).toMatchObject(payload);
  });
});
