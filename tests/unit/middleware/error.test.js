const winston = require("winston");
const error = require("../../../middleware/error");

describe("error middleware", () => {
  it("should call the winston.error", () => {
    winston.error = jest.fn();

    const err = new Error("Error!");
    const req = {};
    const res = {};

    res.status = jest.fn();
    res.send = jest.fn();

    const next = jest.fn();

    error(err, req, res, next);

    expect(winston.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalled();
    expect(res.send).toHaveBeenCalled();
  });
});
