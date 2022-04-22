import Packet from "./Packet";
import fs from "fs/promises";
import path from "path";
import { PacketBound, PacketState } from "./PacketTypes";
import MessageBuffer from "../server/MessageBuffer";

export class PacketRepo {
  private packets: Packet[];

  constructor() {
    this.packets = [];
    Promise.all([
      this.load(path.join(__dirname, "./client")),
      this.load(path.join(__dirname, "./server"))
    ]);
  }

  private async load(dir: string) {
    const files = await fs.readdir(dir, { withFileTypes: true });

    files.forEach(async (file) => {
      if (file.isDirectory()) {
        await this.load(dir + "/" + file.name + "/");
      }
      if (
        file.name.endsWith(".d.ts") ||
        !(file.name.endsWith(".ts") || file.name.endsWith(".js"))
      )
        return;

      try {
        const packet = new (
          await import(path.join(dir, file.name))
        ).default() as Packet;
        this.packets.push(packet);

        console.log(`Loaded packet with id "${packet.id}"`);
      } catch (e) {
        /*if (this.bot.debug) {
          console.log("=================================");
          console.log(`\nFile "${file} is not a valid command\n`);
          console.error(e);
          console.log("\n=================================\n");
        } else {
          console.log(
            `File "${file} is not a valid command. Remove it from the folder, or fix it.`
          );
        }*/
      }
    });
  }

  getPacket(id: number, state: PacketState, bound: PacketBound): Packet | null {
    const packet = this.packets.find((p) => p.id === id && p.state === state && p.bound === bound);
    if (!packet) return null;
    return packet;
  }

  formatUnencryptedPacket(packet: Packet): MessageBuffer {
    // Packet without compression
    /*
    Without compression
Field Name	Field Type	Notes
Length	VarInt	Length of Packet ID + Data
Packet ID	VarInt	
Data	Byte Array	Depends on the connection state and packet ID, see the sections below
    */
    const buf = new MessageBuffer();
    buf.writeVarInt(packet.id);
    buf.writeBuffer(packet.toBytes());
    buf.writeLength();
    return buf;
  }
}

export default new PacketRepo();