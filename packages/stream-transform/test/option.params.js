import "should";
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

  const records = [
    ["a", "b"],
    ["c", "d"],
  ];

  for (const params of [0, false]) {
    describe(JSON.stringify(params), function () {
      const handler = (record, params) => record[0] + params + record[1];
      const expected =
        params === 0 ? ["a0b", "c0d"] : ["afalseb", "cfalsed"];

      it("is treated as defined in sync mode", function () {
        transformSync(records, { params }, handler).should.eql(expected);
      });

      it("is treated as defined in callback mode", function (next) {
        transform(records, { params }, handler, (err, output) => {
          if (err) return next(err);
          output.should.eql(expected);
          next();
        });
      });
    });
  }

  describe("handler ignoring params", function () {
    const handler = (record) => record.join(",");
    const options = { params: { my_key: "my value" } };
    const expected = ["a,b", "c,d"];

    it("runs as a sync handler in sync mode", function () {
      transformSync(records, options, handler).should.eql(expected);
    });

    it("runs as a sync handler in callback mode", function (next) {
      transform(records, options, handler, (err, output) => {
        if (err) return next(err);
        output.should.eql(expected);
        next();
      });
    });
  });
});
