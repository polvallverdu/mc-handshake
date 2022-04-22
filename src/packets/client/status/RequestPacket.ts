import MessageBuffer from "../../../server/MessageBuffer";
import Packet from "../../Packet";
import { PacketBound } from "../../PacketTypes";

export default class RequestPacket extends Packet {
  constructor() {
    super(0x00, PacketBound.SERVER, "STATUS");
  }
}