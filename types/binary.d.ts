export declare enum WireType {
    Varint = 0,
    Fixed64 = 1,
    Bytes = 2,
    Fixed32 = 5
}
export declare class BinaryReader {
    buf: Uint8Array;
    pos: number;
    type: number;
    len: number;
    protected assertBounds(): void;
    constructor(buf?: ArrayLike<number>);
    tag(): [number, WireType, number];
    skip(length?: number): this;
    skipType(wireType: number): this;
    uint32(): number;
    int32(): number;
    sint32(): number;
    fixed32(): number;
    sfixed32(): number;
    int64(): bigint;
    uint64(): bigint;
    sint64(): bigint;
    fixed64(): bigint;
    sfixed64(): bigint;
    float(): void;
    double(): void;
    bool(): boolean;
    bytes(): Uint8Array;
    string(): string;
}
type OpVal = string | number | object | Uint8Array;
declare class Op {
    fn?: (val: OpVal, buf: Uint8Array | number[], pos: number) => void;
    len: number;
    val: OpVal;
    next?: Op;
    constructor(fn: (val: OpVal, buf: Uint8Array | number[], pos: number) => void | undefined, len: number, val: OpVal);
}
declare class State {
    head: Op;
    tail: Op;
    len: number;
    next: State;
    constructor(writer: BinaryWriter);
}
export declare class BinaryWriter {
    len: number;
    head: Op;
    tail: Op;
    states: State;
    constructor();
    static create(): BinaryWriter;
    static alloc(size: number): Uint8Array | number[];
    private _push;
    finish(): Uint8Array;
    fork(): BinaryWriter;
    reset(): BinaryWriter;
    ldelim(): BinaryWriter;
    tag(fieldNo: number, type: WireType): BinaryWriter;
    uint32(value: number): BinaryWriter;
    int32(value: number): BinaryWriter;
    sint32(value: number): BinaryWriter;
    int64(value: string | number | bigint): BinaryWriter;
    uint64: (value: string | number | bigint) => BinaryWriter;
    sint64(value: string | number | bigint): BinaryWriter;
    fixed64(value: string | number | bigint): BinaryWriter;
    sfixed64: (value: string | number | bigint) => BinaryWriter;
    bool(value: boolean): BinaryWriter;
    fixed32(value: number): BinaryWriter;
    sfixed32: (value: number) => BinaryWriter;
    float(value: number): BinaryWriter;
    double(value: number): BinaryWriter;
    bytes(value: Uint8Array): BinaryWriter;
    string(value: string): BinaryWriter;
}
export {};
