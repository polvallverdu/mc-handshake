import MessageBuffer from "../../../server/MessageBuffer";
import { DataTypes } from "../../DataTypes";
import Packet from "../../Packet";
import { PacketBound } from "../../PacketTypes";

export default class DisconnectLoginPacket extends Packet {
  // TODO: Reason for disconnect in Chat var

  constructor(reason: string="{}") {
    super(0x00, PacketBound.CLIENT, "LOGIN");
  }

  public toBytes(): MessageBuffer {
    const buf = new MessageBuffer();
    buf.writeString("{}");
    return buf;
  }
}