import MessageBuffer from "../../../server/MessageBuffer";
import Packet from "../../Packet";
import { PacketBound } from "../../PacketTypes";

export default class PingPacket extends Packet {
  payload: number;

  constructor() {
    super(0x01, PacketBound.SERVER, "STATUS");
    this.payload = 0;
  }

  public fromBytes(buf: MessageBuffer): void {
    this.payload = buf.readLong();
  }
}