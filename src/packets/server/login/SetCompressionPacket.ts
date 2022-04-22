import MessageBuffer from "../../../server/MessageBuffer";
import { DataTypes } from "../../DataTypes";
import Packet from "../../Packet";
import { PacketBound } from "../../PacketTypes";

export default class SetCompressionPacket extends Packet {
  threshold: number;

  constructor(threshold: number=0) {
    super(0x03, PacketBound.CLIENT, "LOGIN");
    this.threshold = threshold;
  }

  public toBytes(): MessageBuffer {
    const buf = new MessageBuffer();
    buf.writeVarInt(this.threshold);
    return buf;
  }
}