import MessageBuffer from "../../../server/MessageBuffer";
import { DataTypes } from "../../DataTypes";
import Packet from "../../Packet";
import { PacketBound } from "../../PacketTypes";

export default class PongPacket extends Packet {
  readonly payload: number;

  constructor(payload: number=0) {
    super(0x01, PacketBound.CLIENT, "STATUS");
    this.payload = payload;
  }

  public toBytes(): MessageBuffer {
    const buf = new MessageBuffer();
    buf.writeLong(this.payload);
    return buf;
  }
}