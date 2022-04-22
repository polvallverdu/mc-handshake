import MessageBuffer from "../../../server/MessageBuffer";
import { DataTypes } from "../../DataTypes";
import Packet from "../../Packet";
import { PacketBound } from "../../PacketTypes";

export default class EncryptionRequestPacket extends Packet {
  serverId: string;
  publicKeyLength: number;
  publicKey: Buffer;
  verifyTokenLength: number;
  verifyToken: Buffer;

  constructor(serverId: string="", publicKeyLength: number=0, publicKey: Buffer=Buffer.alloc(0), verifyTokenLength: number=0, verifyToken: Buffer=Buffer.alloc(0)) {
    super(0x01, PacketBound.CLIENT, "LOGIN");
    this.serverId = serverId;
    this.publicKeyLength = publicKeyLength;
    this.publicKey = publicKey;
    this.verifyTokenLength = verifyTokenLength;
    this.verifyToken = verifyToken;
  }

  public toBytes(): MessageBuffer {
    const buf = new MessageBuffer();
    buf.writeString(this.serverId);
    buf.writeVarInt(this.publicKeyLength);
    buf.writeBytes(this.publicKey);
    buf.writeVarInt(this.verifyTokenLength);
    buf.writeBytes(this.verifyToken);
    return buf;
  }
}