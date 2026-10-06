import "should";
import { stringify } from "../lib/index.js";
import { stringify as stringifySync } from "../lib/sync.js";

describe("Option `on_record`", function () {
  const records = [
    ["a", "b"],
    ["c", "d"],
  ];
  const expected = "a,b\nc,d\n";

  it("is called for every record with sync", function () {
    const calls = [];
    const output = stringifySync(records, {
      on_record: (record, index) => {
        calls.push([record, index]);
      },
    });
    output.should.eql(expected);
    calls.should.eql([
      [records[0], 0],
      [records[1], 1],
    ]);
  });

  it("is called for every record with the callback api", function (next) {
    const calls = [];
    stringify(
      records,
      {
        on_record: (record, index) => {
          calls.push([record, index]);
        },
      },
      (err, output) => {
        if (err) return next(err);
        output.should.eql(expected);
        calls.should.eql([
          [records[0], 0],
          [records[1], 1],
        ]);
        next();
      },
    );
  });

  it("is called for every record with the stream api", function (next) {
    const calls = [];
    const stringifier = stringify({
      on_record: (record, index) => {
        calls.push([record, index]);
      },
    });
    stringifier.on("error", next);
    stringifier.on("finish", () => {
      calls.should.eql([
        [records[0], 0],
        [records[1], 1],
      ]);
      next();
    });
    for (const record of records) {
      stringifier.write(record);
    }
    stringifier.end();
  });

  it("still emits the `record` event when the option is set", function (next) {
    const optionCalls = [];
    const eventCalls = [];
    const stringifier = stringify({
      on_record: (record, index) => {
        optionCalls.push(index);
      },
    });
    stringifier.on("record", (record, index) => {
      eventCalls.push(index);
    });
    stringifier.on("error", next);
    stringifier.on("finish", () => {
      optionCalls.should.eql([0, 1]);
      eventCalls.should.eql([0, 1]);
      next();
    });
    for (const record of records) {
      stringifier.write(record);
    }
    stringifier.end();
  });
});
