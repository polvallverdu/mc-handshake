import MessageBuffer from "../../../server/MessageBuffer";
import Packet from "../../Packet";
import { PacketBound } from "../../PacketTypes";

export default class EncryptionResponsePacket extends Packet {
  sharedSecretLength: number;
  sharedSecret: Buffer;
  verifyTokenLength: number;
  verifyToken: Buffer;

  constructor() {
    super(0x01, PacketBound.SERVER, "LOGIN");
    this.sharedSecretLength = 0;
    this.sharedSecret = Buffer.alloc(0);
    this.verifyTokenLength = 0;
    this.verifyToken = Buffer.alloc(0);
  }

  public fromBytes(buf: MessageBuffer): void {
    this.sharedSecretLength = buf.readVarInt();
    this.sharedSecret = buf.readBytes(128);
    this.verifyTokenLength = buf.readVarInt();
    this.verifyToken = buf.readBytes(128);
  }
}