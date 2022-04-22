import MessageBuffer from "../../../server/MessageBuffer";
import Packet from "../../Packet";
import { PacketBound } from "../../PacketTypes";

export default class LoginStartPacket extends Packet {
  playerName: string;

  constructor() {
    super(0x00, PacketBound.SERVER, "LOGIN");
    this.playerName = "";
  }

  public fromBytes(buf: MessageBuffer): void {
    this.playerName = buf.readString();
  }
}