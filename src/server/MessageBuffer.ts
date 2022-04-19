const SEGMENT_BITS = 0x7F;
const CONTINUE_BIT = 0x80;


export default class MessageBuffer {
  private buffer: Buffer;

  constructor(buffer: Buffer) {
    this.buffer = buffer;
  }

  getBoolean(): boolean {
    return this.readByte() === 1;
  }

  readBytes(amount: number=1): Buffer {
    const bytes = this.buffer.slice(0, amount);
    this.buffer = this.buffer.slice(amount);
    return bytes;
  }

  private readNumber(amount: number=1, signed: boolean=true) {
    const bytes = this.readBytes(amount);
    let number = 0;
    for (let i = 0; i < amount; i++) {
      number += bytes.readUInt8(i) << (i * 8);
    }
    if (signed) {
      number = number >> 1;
      number = number ^ -(number & 1);
    }
    return number;
  }

  readByte(): number {
    // An integer between -128 and 127
    // Signed 8-bit integer, two's complement [https://en.wikipedia.org/wiki/Two%27s_complement]
    return this.readNumber();
  }

  readUnsignedByte(): number {
    // An integer between 0 and 255
    // Unsigned 8-bit integer
    return this.readNumber(1, false);
  }

  readShort(): number {
    // An integer between -32768 and 32767
    // Signed 16-bit integer, two's complement
    return this.readNumber(2);
  }

  readUnsignedShort(): number {
    // An integer between 0 and 65535
    // Unsigned 16-bit integer
    return this.readNumber(2, false);
  }

  readInt(): number {
    // An integer between -2147483648 and 2147483647
    // Signed 32-bit integer, two's complement
    return this.readNumber(4);
  }

  readLong(): number {
    // An integer between -9223372036854775808 and 9223372036854775807
    // Signed 64-bit integer, two's complement
    return this.readNumber(8);
  }

  readFloat(): number {
    // A single-precision 32-bit IEEE 754 floating point number.
    const bytes = this.readBytes(4);
    return bytes.readFloatBE(0);
  }

  readDouble(): number {
    // A double-precision 64-bit IEEE 754 floating point number.
    const bytes = this.readBytes(8);
    return bytes.readDoubleBE(0);
  }

  readString(): string {
    // A sequence of Unicode scalar values [https://en.wikipedia.org/wiki/Unicode] [https://unicode.org/glossary/#unicode_scalar_value]
    // UTF-8 [https://en.wikipedia.org/wiki/UTF-8] string prefixed with its size in bytes as a VarInt. Maximum length of n characters, which varies by context; up to n × 4 bytes can be used to encode n characters and both of those limits are checked. Maximum n value is 32767. The + 3 is due to the max size of a valid length VarInt
    const length = this.readVarInt() + 3;
    const bytes = this.readBytes(length);
    return bytes.toString("utf8");
  }

  readVarInt(): number {
    // An integer between -2147483648 and 2147483647
    // Variable-length data encoding a two's complement signed 32-bit integer; more info in their section

    /*
    Variable-length format such that smaller numbers use fewer bytes. These are very similar to Protocol Buffer Varints: the 7 least significant bits are used to encode the value and the most significant bit indicates whether there's another byte after it for the next part of the number. The least significant group is written first, followed by each of the more significant groups; thus, VarInts are effectively little endian (however, groups are 7 bits, not 8).

    VarInts are never longer than 5 bytes, and VarLongs are never longer than 10 bytes.

    Pseudocode to read and write VarInts and VarLongs:

    private static final int SEGMENT_BITS = 0x7F;
    private static final int CONTINUE_BIT = 0x80;
    public int readVarInt() {
        int value = 0;
        int position = 0;
        byte currentByte;

        while (true) {
            currentByte = readByte();
            value |= (currentByte & SEGMENT_BITS) << position;

            if ((currentByte & CONTINUE_BIT) == 0) break;

            position += 7;

            if (position >= 32) throw new RuntimeException("VarInt is too big");
        }

        return value;
    }

    */
    let value = 0;
    let position = 0;
    let currentByte;

    while (true) {
      currentByte = this.readByte();
      value |= (currentByte & SEGMENT_BITS) << position;

      if ((currentByte & CONTINUE_BIT) == 0) break;

      position += 7;

      if (position >= 32) throw new Error("VarInt is too big");
    }

    return value;
  }

  readVarLong(): number {
    /*
    public long readVarLong() {
        long value = 0;
        int position = 0;
        byte currentByte;

        while (true) {
            currentByte = readByte();
            value |= (currentByte & SEGMENT_BITS) << position;

            if ((currentByte & CONTINUE_BIT) == 0) break;

            position += 7;

            if (position >= 64) throw new RuntimeException("VarLong is too big");
        }

        return value;
    }
    */

    let value = 0;
    let position = 0;
    let currentByte;

    while (true) {
      currentByte = this.readByte();
      value |= (currentByte & SEGMENT_BITS) << position;

      if ((currentByte & CONTINUE_BIT) == 0) break;

      position += 7;

      if (position >= 64) throw new Error("VarLong is too big");
    }

    return value;
  }

  private writeBytes(value: Buffer) {
    this.buffer = Buffer.concat([this.buffer, value]);
  }

  writeBoolean(value: boolean) {
    this.writeByte(value ? 1 : 0);
  }

  private writeNumber(value: number, amount: number=1, signed: boolean=true) {
    const bytes = Buffer.alloc(amount);
    for (let i = 0; i < amount; i++) {
      bytes.writeUInt8(value >> (i * 8), i);
    }
    this.writeBytes(bytes);
  }

  writeByte(value: number) {
    this.writeNumber(value);
  }

  writeUnsignedByte(value: number) {
    this.writeNumber(value, 1, false);
  }

  writeShort(value: number) {
    this.writeNumber(value, 2);
  }

  writeUnsignedShort(value: number) {
    this.writeNumber(value, 2, false);
  }

  writeInt(value: number) {
    this.writeNumber(value, 4);
  }

  writeLong(value: number) {
    this.writeNumber(value, 8);
  }

  writeFloat(value: number) {
    const bytes = Buffer.alloc(4);
    bytes.writeFloatBE(value, 0);
    this.writeBytes(bytes);
  }

  writeDouble(value: number) {
    const bytes = Buffer.alloc(8);
    bytes.writeDoubleBE(value, 0);
    this.writeBytes(bytes);
  }

  writeString(value: string) {
    const bytes = Buffer.from(value, "utf8");
    this.writeVarInt(bytes.length);
    this.writeBytes(bytes);
  }

  writeVarInt(value: number) {
    /*
    public void writeVarInt(int value) {
        while (true) {
            if ((value & ~SEGMENT_BITS) == 0) {
              writeByte(value);
              return;
            }

            writeByte((value & SEGMENT_BITS) | CONTINUE_BIT);
            // Note: >>> means that the sign bit is shifted with the rest of the number rather than being left alone
            value >>>= 7;
        }
    }
    */
    while (true) {
      if ((value & ~SEGMENT_BITS) == 0) {
        this.writeByte(value);
        return;
      }

      this.writeByte((value & SEGMENT_BITS) | CONTINUE_BIT);
      // Note: >>> means that the sign bit is shifted with the rest of the number rather than being left alone
      value >>>= 7;
    }
  }

  writeVarLong(value: number) {
    this.writeVarInt(value);
  }

}