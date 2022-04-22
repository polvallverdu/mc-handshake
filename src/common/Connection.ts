import { randomUUID } from "crypto";
import EventEmitter from "events";
import { Socket } from "net";
import PacketHandler from "../packets/PacketHandler";
import { PacketBound, PacketState } from "../packets/PacketTypes";
import MessageBuffer from "../server/MessageBuffer";

function cooldown(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default class Connection extends EventEmitter {
  private socket: Socket;
  private state: PacketState = "HANDSHAKE";
  private uuid: string = randomUUID();

  constructor(socket: Socket) {
    super();
    this.socket = socket;
    this.socket.on("data", async (data: Buffer) => {
      const buf = new MessageBuffer(data);
      while (buf.length > 0) {
        const length = buf.readVarInt();
        const newBuf = buf.slice(length);
        this.launchPacket(length, newBuf);
      }
    });
  }

  private launchPacket(length: number, buf: MessageBuffer) {
    const packetId = buf.readVarInt();

    const packet = PacketHandler.getPacket(packetId, this.state, PacketBound.SERVER);
    if (packet === null) {
      console.log(`${this.uuid} received unknown packet ${packetId} ${this.state}`);
      return;
    } else {
      console.log(`${this.uuid} received packet ${packetId} ${this.state}`);
    }
    packet.fromBytes(buf);

    this.emit("packet", packet, length);
  }

  public write(data: Buffer): void {
    this.socket.write(data);
  }

  public end() {
    this.socket.end();
  }

  public changeState(state: PacketState) {
    this.state = state;
  }

  public getState() {
    return this.state;
  }

}