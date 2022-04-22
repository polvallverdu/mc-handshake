import MessageBuffer from "../../../server/MessageBuffer";
import { DataTypes } from "../../DataTypes";
import Packet from "../../Packet";
import { PacketBound } from "../../PacketTypes";

export default class LoginSuccessPacket extends Packet {
  uuid: string;
  username: string;

  constructor(uuid: string="", username: string="") {
    super(0x02, PacketBound.CLIENT, "LOGIN");
    this.uuid = uuid;
    this.username = username;
  }

  public toBytes(): MessageBuffer {
    const buf = new MessageBuffer();
    buf.writeUUID(this.uuid);
    buf.writeString(this.username);
    return buf;
  }
}