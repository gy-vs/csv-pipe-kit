import "should";
import { parse } from "../lib/index.js";
import { parse as parseSync } from "../lib/sync.js";

describe("Option `objname`", function () {
  describe("validation", function () {
    it("does not accept boolean", function () {
      (() => {
        parse("", { objname: true }, () => {});
      }).should.throw(
        "Invalid Option: objname must be a string or a buffer, got true",
      );
    });
  });

  describe("index 0", function () {
    const data = "k1,v1\nk2,v2\n";
    const expected = {
      k1: ["k1", "v1"],
      k2: ["k2", "v2"],
    };

    it("indexes records by the first column in sync mode", function () {
      const records = parseSync(data, { objname: 0 });
      Array.isArray(records).should.be.false();
      Object.assign({}, records).should.eql(expected);
    });

    it("returns the same records in callback mode", function (next) {
      parse(data, { objname: 0 }, (err, records) => {
        if (err) return next(err);
        Array.isArray(records).should.be.false();
        Object.assign({}, records).should.eql(expected);
        next();
      });
    });
  });
});
