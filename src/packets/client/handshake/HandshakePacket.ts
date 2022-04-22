import MessageBuffer from "../../../server/MessageBuffer";
import { DataTypes } from "../../DataTypes";
import Packet from "../../Packet";
import { PacketBound } from "../../PacketTypes";

export default class HandshakePacket extends Packet {
  protocolVersion: number;
  serverAddress: string;
  serverPort: number;
  nextState: number;

  constructor() {
    super(0x00, PacketBound.SERVER, "HANDSHAKE");
    this.protocolVersion = 0;
    this.serverAddress = "";
    this.serverPort = 0;
    this.nextState = 0;
  }

  public fromBytes(buf: MessageBuffer): void {
    this.protocolVersion = buf.readVarInt();
    this.serverAddress = buf.readString();
    this.serverPort = buf.readUnsignedShort();
    this.nextState = buf.readVarInt();
  }
}