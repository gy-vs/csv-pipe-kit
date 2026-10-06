import { generate } from "csv-generate";
import { transform } from "../lib/index.js";
import { transform as transformSync } from "../lib/sync.js";

describe("option.params", function () {
  it("sync", function (next) {
    const generator = generate({ length: 100, objectMode: true, seed: 1 });
    const transformer = generator.pipe(
      transform(
        (record, params) => {
          params.my_key.should.eql("my value");
        },
        {
          parallel: 10,
          consume: true,
          params: { my_key: "my value" },
        },
      ),
    );
    transformer.on("error", next);
    transformer.on("finish", () => {
      next();
    });
  });

  it("async", function (next) {
    const generator = generate({ length: 100, objectMode: true, seed: 1 });
    const transformer = generator.pipe(
      transform(
        (record, callback, params) => {
          params.my_key.should.eql("my value");
          setImmediate(() => callback(null, ""));
        },
        {
          parallel: 10,
          consume: true,
          params: { my_key: "my value" },
        },
      ),
    );
    transformer.on("error", next);
    transformer.on("finish", () => {
      next();
    });
  });

  describe("falsy values", function () {
    for (const params of [0, false]) {
      it(`handles \`${params}\` as set params with the sync api`, function () {
        const data = transformSync(
          ["ab", "cd"],
          { params },
          (record, param) => record[0] + param + record[1],
        );
        data.should.eql([`a${params}b`, `c${params}d`]);
      });

      it(`handles \`${params}\` as set params with the callback api`, function (next) {
        transform(
          ["ab", "cd"],
          { params },
          (record, param) => record[0] + param + record[1],
          (err, data) => {
            if (err) return next(err);
            data.should.eql([`a${params}b`, `c${params}d`]);
            next();
          },
        );
      });
    }
  });

  describe("handler ignoring params", function () {
    it("runs a one-argument sync handler with the sync api", function () {
      const data = transformSync(
        ["ab", "cd"],
        { params: { a_key: "a value" } },
        (record) => record,
      );
      data.should.eql(["ab", "cd"]);
    });

    it("runs a one-argument sync handler with the callback api", function (next) {
      transform(
        ["ab", "cd"],
        { params: { a_key: "a value" } },
        (record) => record,
        (err, data) => {
          if (err) return next(err);
          data.should.eql(["ab", "cd"]);
          next();
        },
      );
    });

    it("does not emit an error after the sync api returns", function (next) {
      transformSync(
        ["ab", "cd"],
        { params: { a_key: "a value" } },
        (record) => record,
      );
      // Any background "error" event would crash the process before
      // the timer callback gets a chance to run
      setTimeout(next, 10);
    });
  });
});
