import MessageBuffer from "../server/MessageBuffer";
import { DataTypes } from "./DataTypes";
import { PacketBound, PacketState } from "./PacketTypes";

export default class Packet {
  readonly id: number;
  readonly bound: PacketBound;
  readonly state: PacketState;

  constructor(id: number, bound: PacketBound, state: PacketState) {
    this.id = id;
    this.bound = bound;
    this.state = state;
  }

  public fromBytes(buf: MessageBuffer) {

  }

  public toBytes(): MessageBuffer {
    return new MessageBuffer();
  }

}