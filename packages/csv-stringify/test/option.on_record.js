import "should";
import { stringify } from "../lib/index.js";
import { stringify as stringifySync } from "../lib/sync.js";

describe("Option `on_record`", function () {
  const records = [
    ["a", "b"],
    ["c", "d"],
  ];

  it("is called once per record in sync mode", function () {
    const calls = [];
    const data = stringifySync(records, {
      on_record: (record, index) => {
        calls.push([record, index]);
      },
    });
    data.should.eql("a,b\nc,d\n");
    calls.should.eql([
      [records[0], 0],
      [records[1], 1],
    ]);
  });

  it("is called once per record in callback mode", function (next) {
    const calls = [];
    stringify(
      records,
      {
        on_record: (record, index) => {
          calls.push([record, index]);
        },
      },
      (err, data) => {
        if (err) return next(err);
        data.should.eql("a,b\nc,d\n");
        calls.should.eql([
          [records[0], 0],
          [records[1], 1],
        ]);
        next();
      },
    );
  });

  it("is called once per record in stream mode", function (next) {
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

  it("still emits the `record` event in stream mode", function (next) {
    const events = [];
    const optionCalls = [];
    const stringifier = stringify({
      on_record: (record, index) => {
        optionCalls.push(index);
      },
    });
    stringifier.on("record", (record, index) => {
      events.push(index);
    });
    stringifier.on("error", next);
    stringifier.on("finish", () => {
      events.should.eql([0, 1]);
      optionCalls.should.eql([0, 1]);
      next();
    });
    for (const record of records) {
      stringifier.write(record);
    }
    stringifier.end();
  });
});
