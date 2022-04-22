import MessageBuffer from "../../../server/MessageBuffer";
import { DataTypes } from "../../DataTypes";
import Packet from "../../Packet";
import { PacketBound } from "../../PacketTypes";

export default class ResponsePacket extends Packet {
  response: string;

  constructor(response: string="") {
    super(0x00, PacketBound.CLIENT, "STATUS");
    this.response = response;
  }

  public toBytes(): MessageBuffer {
    const buf = new MessageBuffer();
    buf.writeString(this.response);
    return buf;
  }

  // For debug purposes
  public fromBytes(buf: MessageBuffer): void {
    this.response = buf.readString();
  }
}