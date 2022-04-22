import MessageBuffer from "../../../server/MessageBuffer";
import Packet from "../../Packet";
import { PacketBound } from "../../PacketTypes";

export default class LoginPluginResponse extends Packet {
  messageId: number;
  successful: boolean;
  // TODO: Optional data?

  constructor() {
    super(0x02, PacketBound.SERVER, "LOGIN");
    this.messageId = 0;
    this.successful = false;
  }

  public fromBytes(buf: MessageBuffer): void {
    this.messageId = buf.readVarInt();
    this.successful = buf.readBoolean();
  }
}