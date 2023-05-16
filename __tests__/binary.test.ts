import { BinaryReader, BinaryWriter, WireType } from "../src/binary";

import * as _m0 from "protobufjs/minimal";

import cases from "jest-in-case";

function getTag(fieldNo, type) {
  return (fieldNo << 3) | type;
}

function getFromTag(tag) {
  const fieldNo = tag >>> 3,
    wireType = tag & 7;
  return [fieldNo, wireType];
}

describe("misc", () => {
  it("init reader", async () => {
    const reader = new BinaryReader();

    expect(reader.buf.length).toBeGreaterThanOrEqual(0);
  });

  it("init writer", async () => {
    const writer = new BinaryWriter();

    expect(writer.len).toBe(0);
  });

  it("alloc", async () => {
    let buf = BinaryWriter.alloc(7);

    expect(buf.length).toBeGreaterThanOrEqual(7);

    buf = BinaryWriter.alloc(35);

    expect(buf.length).toBeGreaterThanOrEqual(35);
  });
});

function getUseCase(
  desc: string,
  method,
  value,
  type,
  compare?,
  isTestingWrite = false
) {
  return {
    name: `${method} = ${value.toString().substring(0, 100)}${desc.trim() === "" ? "" : ` (${desc})`
      }`,
    readerCreater: (buf) =>
      isTestingWrite ? new _m0.Reader(buf) : new BinaryReader(buf),
    writer: isTestingWrite ? BinaryWriter.create() : _m0.Writer.create(),
    type,
    method,
    value,
    compare,
  };
}

const int64Compare = (result, value) => {
  expect(result.toString()).toBe(value);
};

const readerUseCases = [
  getUseCase("", "uint32", 12, WireType.Varint),
  getUseCase("max", "uint32", 4294967295, WireType.Varint),
  getUseCase("", "int32", 13, WireType.Varint),
  getUseCase("min", "int32", -2147483648, WireType.Varint),
  getUseCase("max", "int32", 2147483647, WireType.Varint),
  getUseCase("", "sint32", 14, WireType.Varint),
  getUseCase("min", "sint32", -2147483648, WireType.Varint),
  getUseCase("max", "sint32", 2147483647, WireType.Varint),
  getUseCase("", "fixed32", 15, WireType.Fixed32),
  getUseCase("max", "fixed32", 4294967295, WireType.Fixed32),
  getUseCase("", "sfixed32", 16, WireType.Fixed32),
  getUseCase("min", "sfixed32", -2147483648, WireType.Fixed32),
  getUseCase("max", "sfixed32", 2147483647, WireType.Fixed32),
  getUseCase("", "int64", "17", WireType.Varint, int64Compare),
  getUseCase(
    "min",
    "int64",
    "-9223372036854775808",
    WireType.Varint,
    int64Compare
  ),
  getUseCase(
    "max",
    "int64",
    "9223372036854775807",
    WireType.Varint,
    int64Compare
  ),
  getUseCase("", "uint64", "18", WireType.Varint, int64Compare),
  getUseCase("min", "uint64", "0", WireType.Varint, int64Compare),
  getUseCase(
    "max",
    "uint64",
    "18446744073709551615",
    WireType.Varint,
    int64Compare
  ),
  getUseCase("", "sint64", "19", WireType.Varint, int64Compare),
  getUseCase(
    "min",
    "sint64",
    "-9223372036854775808",
    WireType.Varint,
    int64Compare
  ),
  getUseCase(
    "max",
    "sint64",
    "9223372036854775807",
    WireType.Varint,
    int64Compare
  ),
  getUseCase("", "fixed64", "20", WireType.Fixed64, int64Compare),
  getUseCase("min", "fixed64", "0", WireType.Fixed64, int64Compare),
  getUseCase(
    "max",
    "fixed64",
    "18446744073709551615",
    WireType.Fixed64,
    int64Compare
  ),
  getUseCase("", "sfixed64", "21", WireType.Fixed64, int64Compare),
  getUseCase(
    "min",
    "sfixed64",
    "-9223372036854775808",
    WireType.Fixed64,
    int64Compare
  ),
  getUseCase(
    "max",
    "sfixed64",
    "9223372036854775807",
    WireType.Fixed64,
    int64Compare
  ),
  getUseCase("true", "bool", true, WireType.Varint),
  getUseCase("false", "bool", false, WireType.Varint),
  getUseCase("empty", "string", "", WireType.Bytes),
  getUseCase("normal", "string", "normalnormalnormal", WireType.Bytes),
  getUseCase(
    "long",
    "string",
    (() => {
      let result = "this's a long one.";
      for (let i = 0; i < 10; i++) {
        result += result;
      }
      return result;
    })(),
    WireType.Bytes
  ),
  getUseCase("utf-8", "string", "我是谁？", WireType.Bytes),
];

describe("reader", () => {
  it("tag", async () => {
    const writer = _m0.Writer.create();

    writer.uint32(getTag(1, WireType.Bytes)).string("abc");

    const buf = writer.finish();

    const reader = new BinaryReader(buf);

    const [fieldNo, wireType] = reader.tag();

    expect(fieldNo).toBe(1);
    expect(wireType).toBe(WireType.Bytes);
  });

  it("skip", async () => {
    const writer = _m0.Writer.create();

    writer.uint32(getTag(1, WireType.Varint)).int32(10);
    writer.uint32(getTag(2, WireType.Varint)).int32(20);

    writer.uint32(getTag(3, WireType.Bytes)).string("a");
    writer.uint32(getTag(4, WireType.Bytes)).string("b");

    writer.uint32(getTag(5, WireType.Fixed32)).fixed32(30);
    writer.uint32(getTag(6, WireType.Fixed32)).fixed32(40);

    writer.uint32(getTag(7, WireType.Fixed64)).fixed64(50);
    writer.uint32(getTag(8, WireType.Fixed64)).fixed64(60);

    const buf = writer.finish();

    const reader = new BinaryReader(buf);

    let [fieldNo, wireType, tag] = reader.tag();
    reader.skipType(wireType);
    [fieldNo, wireType, tag] = reader.tag();
    expect(fieldNo).toBe(2);
    expect(wireType).toBe(WireType.Varint);
    reader.skipType(wireType);

    [fieldNo, wireType, tag] = reader.tag();
    reader.skipType(wireType);
    [fieldNo, wireType, tag] = reader.tag();
    expect(fieldNo).toBe(4);
    expect(wireType).toBe(WireType.Bytes);
    reader.skipType(wireType);

    [fieldNo, wireType, tag] = reader.tag();
    reader.skipType(wireType);
    [fieldNo, wireType, tag] = reader.tag();
    expect(fieldNo).toBe(6);
    expect(wireType).toBe(WireType.Fixed32);
    reader.skipType(wireType);

    [fieldNo, wireType, tag] = reader.tag();
    reader.skipType(wireType);
    [fieldNo, wireType, tag] = reader.tag();
    expect(fieldNo).toBe(8);
    expect(wireType).toBe(WireType.Fixed64);
    reader.skipType(wireType);
  });

  cases(
    "reading methods",
    (opt) => {
      testReadAndWrite(
        opt.readerCreater,
        opt.writer,
        opt.type,
        opt.method,
        opt.value,
        opt.compare
      );
    },
    readerUseCases
  );
});

const writerUseCases = [
  getUseCase("", "uint32", 12, WireType.Varint, undefined, true),
  getUseCase("max", "uint32", 4294967295, WireType.Varint, undefined, true),
  getUseCase("", "int32", 13, WireType.Varint, undefined, true),
  getUseCase("min", "int32", -2147483648, WireType.Varint, undefined, true),
  getUseCase("max", "int32", 2147483647, WireType.Varint, undefined, true),
  getUseCase("", "sint32", 14, WireType.Varint, undefined, true),
  getUseCase("min", "sint32", -2147483648, WireType.Varint, undefined, true),
  getUseCase("max", "sint32", 2147483647, WireType.Varint, undefined, true),
  getUseCase("", "fixed32", 15, WireType.Fixed32, undefined, true),
  getUseCase("max", "fixed32", 4294967295, WireType.Fixed32, undefined, true),
  getUseCase("", "sfixed32", 16, WireType.Fixed32, undefined, true),
  getUseCase("min", "sfixed32", -2147483648, WireType.Fixed32, undefined, true),
  getUseCase("max", "sfixed32", 2147483647, WireType.Fixed32, undefined, true),
  getUseCase("", "int64", "17", WireType.Varint, int64Compare, true),
  getUseCase(
    "min",
    "int64",
    "-9223372036854775808",
    WireType.Varint,
    int64Compare,
    true
  ),
  getUseCase(
    "max",
    "int64",
    "9223372036854775807",
    WireType.Varint,
    int64Compare,
    true
  ),
  getUseCase("", "uint64", "18", WireType.Varint, int64Compare, true),
  getUseCase("min", "uint64", "0", WireType.Varint, int64Compare, true),
  getUseCase(
    "max",
    "uint64",
    "18446744073709551615",
    WireType.Varint,
    int64Compare,
    true
  ),
  getUseCase("", "sint64", "19", WireType.Varint, int64Compare, true),
  getUseCase(
    "min",
    "sint64",
    "-9223372036854775808",
    WireType.Varint,
    int64Compare,
    true
  ),
  getUseCase(
    "max",
    "sint64",
    "9223372036854775807",
    WireType.Varint,
    int64Compare,
    true
  ),
  getUseCase("", "fixed64", "20", WireType.Fixed64, int64Compare, true),
  getUseCase("min", "fixed64", "0", WireType.Fixed64, int64Compare, true),
  getUseCase(
    "max",
    "fixed64",
    "18446744073709551615",
    WireType.Fixed64,
    int64Compare,
    true
  ),
  getUseCase("", "sfixed64", "21", WireType.Fixed64, int64Compare, true),
  getUseCase(
    "min",
    "sfixed64",
    "-9223372036854775808",
    WireType.Fixed64,
    int64Compare,
    true
  ),
  getUseCase(
    "max",
    "sfixed64",
    "9223372036854775807",
    WireType.Fixed64,
    int64Compare,
    true
  ),
  getUseCase("true", "bool", true, WireType.Varint, undefined, true),
  getUseCase("false", "bool", false, WireType.Varint, undefined, true),
  getUseCase("empty", "string", "", WireType.Bytes, undefined, true),
  getUseCase(
    "normal",
    "string",
    "normalnormalnormal",
    WireType.Bytes,
    undefined,
    true
  ),
  getUseCase(
    "long",
    "string",
    (() => {
      let result = "this's a long one.";
      for (let i = 0; i < 10; i++) {
        result += result;
      }
      return result;
    })(),
    WireType.Bytes,
    undefined,
    true
  ),
  getUseCase("utf-8", "string", "我是谁？", WireType.Bytes, undefined, true),
];

describe("writer", () => {
  cases(
    "writing methods",
    (opt) => {
      testReadAndWrite(
        opt.readerCreater,
        opt.writer,
        opt.type,
        opt.method,
        opt.value,
        opt.compare
      );
    },
    writerUseCases
  );

  // basic array
  it("basic array", () => {
    const writer = new BinaryWriter();

    const int32Cases = [2, 8, -2, 90];
    writer.uint32(getTag(1, WireType.Bytes)).fork();
    for (const v of int32Cases) {
      writer.int32(v);
    }
    writer.ldelim();

    const int64Cases = ["2", "8", "-2", "90", Number.MAX_SAFE_INTEGER];
    writer.uint32(getTag(2, WireType.Bytes)).fork();
    for (const v of int64Cases) {
      writer.int64(v);
    }
    writer.ldelim();

    const stringCases = [
      "a",
      "b",
      "abc",
      "90",
      Number.MAX_SAFE_INTEGER.toString(),
    ];
    for (const v of stringCases) {
      writer.uint32(getTag(3, WireType.Bytes)).string(v);
    }

    const buf = writer.finish();
    const reader = new BinaryReader(buf);
    const end = reader.len;

    const results = {
      f1: [],
      f2: [],
      f3: [],
    };

    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              results.f1.push(reader.int32());
            }
          } else {
            results.f1.push(reader.int32());
          }
          break;
        case 2:
          if ((tag & 7) === 2) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              results.f2.push(reader.int64());
            }
          } else {
            results.f2.push(reader.int64());
          }
          break;
        case 3:
          results.f3.push(reader.string());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }

    expect(results.f1.join(",")).toBe(int32Cases.join(","));
    expect(results.f2.join(",")).toBe(int64Cases.join(","));
  });

  // obj array
  it("obj array", () => {
    //write
    const m = new Message();
    m.inner = [
      new InnerMessage(),
      new InnerMessage(BigInt(1001)),
      new InnerMessage(BigInt(-1001)),
    ];

    const buf = Message.encode(m).finish();
    //read
    const result = Message.decode(buf);

    expect(result.inner.length).toBe(3);
    expect(result.inner[0].f1).toBeUndefined();
    expect(result.inner[2].f1).toBe(BigInt(-1001));
  });

  // hash
  it("hash", () => {
    //write
    const m = createBaseMessageWithEntry();

    m.entries = {
      a: BigInt("201"),
      b: BigInt("202"),
    };

    const buf = MessageWithEntry.encode(m).finish();
    //read
    const result = MessageWithEntry.decode(buf as Uint8Array);

    expect(result.entries["a"]).toBe(BigInt("201"));
    expect(result.entries["b"]).toBe(BigInt("202"));
  });
});

function testReadAndWrite(
  readerCreater: (buf: Uint8Array | number[]) => _m0.Reader | BinaryReader,
  writer: _m0.Writer | BinaryWriter,
  type: WireType,
  method: string,
  value: any,
  compare = (result, value) => {
    expect(result).toBe(value);
  }
) {
  writer.uint32(getTag(1, type))[method](value);
  const buf = writer.finish();
  const reader = readerCreater(buf);
  const tag = reader.uint32();
  const [fieldNo, wireType] = getFromTag(tag);
  expect(fieldNo).toBe(1);
  expect(wireType).toBe(type);
  const result = reader[method]();
  compare(result, value);
}

class Message {
  inner: InnerMessage[] = [];

  static encode(
    message: Message,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    for (const v of message.inner) {
      InnerMessage.encode(
        v,
        writer.uint32(getTag(1, WireType.Bytes)).fork()
      ).ldelim();
    }
    return writer;
  }
  static decode(
    input: BinaryReader | Uint8Array | number[],
    length?: number
  ): Message {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new Message();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.inner.push(InnerMessage.decode(reader, reader.uint32()));
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  }
}

class InnerMessage {
  f1?: bigint;

  constructor(f1?: bigint) {
    this.f1 = f1;
  }

  static encode(
    message: InnerMessage,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.f1 !== undefined) {
      writer.uint32(getTag(1, WireType.Varint)).int64(message.f1);
    }
    return writer;
  }
  static decode(
    input: BinaryReader | Uint8Array | number[],
    length?: number
  ): InnerMessage {
    const reader =
      input instanceof BinaryReader ? input : new BinaryReader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = new InnerMessage();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.f1 = reader.int64();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  }
}

export interface MapEntry {
  key: string;
  value: bigint;
}

function createBaseMapEntry(): MapEntry {
  return {
    key: "",
    value: BigInt("0"),
  };
}
export const MapEntry = {
  encode(
    message: MapEntry,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    if (message.key !== "") {
      writer.uint32(10).string(message.key);
    }
    if (message.value !== BigInt(0)) {
      writer.uint32(16).int64(BigInt(message.value.toString()));
    }
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MapEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMapEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.key = reader.string();
          break;
        case 2:
          message.value = BigInt(reader.int64().toString());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
};

export interface MessageWithEntry {
  entries: {
    [key: string]: bigint;
  };
}

function createBaseMessageWithEntry(): MessageWithEntry {
  return {
    entries: {},
  };
}

export const MessageWithEntry = {
  encode(
    message: MessageWithEntry,
    writer: BinaryWriter = BinaryWriter.create()
  ): BinaryWriter {
    Object.entries(message.entries).forEach(([key, value]) => {
      MapEntry.encode(
        {
          key: key as any,
          value,
        },
        writer.uint32(getTag(1, WireType.Bytes)).fork()
      ).ldelim();
    });
    return writer;
  },
  decode(input: _m0.Reader | Uint8Array, length?: number): MessageWithEntry {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    const end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseMessageWithEntry();
    while (reader.pos < end) {
      const tag = reader.uint32();
      let entry2: MapEntry = null;
      switch (tag >>> 3) {
        case 1:
          entry2 = MapEntry.decode(reader, reader.uint32());
          if (entry2?.value !== undefined) {
            message.entries[entry2.key] = entry2.value;
          }
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },
};
