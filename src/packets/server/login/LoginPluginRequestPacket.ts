import MessageBuffer from "../../../server/MessageBuffer";
import { DataTypes } from "../../DataTypes";
import Packet from "../../Packet";
import { PacketBound } from "../../PacketTypes";

export default class LoginPluginRequestPacket extends Packet {
  messageId: number;
  channel: string;
  data: Buffer;

  constructor(messageId: number=0, channel: string="", data: Buffer=Buffer.alloc(0)) {
    super(0x04, PacketBound.CLIENT, "LOGIN");
    this.messageId = messageId;
    this.channel = channel;
    this.data = data;
  }

  public toBytes(): MessageBuffer {
    const buf = new MessageBuffer();
    buf.writeVarInt(this.messageId);
    buf.writeString(this.channel);
    buf.writeBytes(this.data);
    return buf;
  }
}