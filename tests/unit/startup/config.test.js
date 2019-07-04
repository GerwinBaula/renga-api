const config = require("config");
const privateKey = require("../../../startup/config");

describe("config startup", () => {
  it("should throw an exception if jwtPrivateKey is not defined", () => {
    config.get = jest.fn().mockReturnValue(false);
    expect(() => {
      privateKey();
    }).toThrow();
  });
});
