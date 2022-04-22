import { Socket } from "net";
import HandshakePacket from "../packets/client/handshake/HandshakePacket";
import PacketHandler from "../packets/PacketHandler";
import { PacketBound, PacketState } from "../packets/PacketTypes";
import MessageBuffer from "../server/MessageBuffer";
import SocketServer from "../server/SocketServer";
import ResponsePacket from "../packets/server/status/ResponsePacket";
import LoginStartPacket from "../packets/client/login/LoginStartPacket";
import EncryptionRequestPacket from "../packets/server/login/EncryptionRequestPacket";
import crypto from "crypto";
import EncryptionResponsePacket from "../packets/client/login/EncryptionResponsePacket";
import Connection from "../common/Connection";
import RequestPacket from "../packets/client/status/RequestPacket";
import PingPacket from "../packets/client/status/PingPacket";
import PongPacket from "../packets/server/status/PongPacket";
import Packet from "../packets/Packet";
import { textSpanIntersectsWithTextSpan } from "typescript";

export class Player {
  readonly uuid: string;
  readonly socket: Socket;
  readonly host: string;
  readonly port: number;
  readonly protocolVersion: number;
  readonly publicKey: Buffer;
  readonly privateKey: Buffer;

  constructor(res: HandshakeResult) {
    this.uuid = res.uuid;
    this.socket = res.socket;
    this.host = res.host;
    this.port = res.port;
    this.protocolVersion = res.protocolVersion;
    this.publicKey = res.publicKey;
    this.privateKey = res.privateKey;
  }

  private processPacket() {

  }
}

type HandshakeResult = {
  uuid: string;
  protocolVersion: number;
  socket: Socket;
  host: string;
  port: number;
  publicKey: Buffer;
  privateKey: Buffer;
}

type HandshakeStep = "initial" | "status" | "ping" | "login" | "encryption";
type HandshakeType = "status" | "login";

export default class PlayerManager {
  private players: Player[];
  private server: SocketServer;

  constructor() {
    this.players = [];
    this.server = new SocketServer(25565);

    this.server.on("connection", async (s: Socket) => {
      const conn = new Connection(s);
      const result = await this.newHandshake(conn);
      if (result !== null) {
        this.players.push(new Player(result));
      }
    });

    this.server.start();
  }

  private async newHandshake(conn: Connection): Promise<HandshakeResult | null> {
    let step: HandshakeStep = "initial";
    let type: HandshakeType = "status";
    let playerUsername = "";
    let publicKey: string | null = null;
    let privateKey: string | null = null;

    return new Promise((resolve, reject) => {
      conn.on("packet", async (packet: Packet) => {
        if (step === "initial" && packet instanceof HandshakePacket) {
          if (packet.nextState === 1) {
            type = "status";
            step = "status";
          } else {
            step = "login";
            type = "login";
          }
          conn.changeState("STATUS");
        } else if (step === "login" && packet instanceof LoginStartPacket) {
          playerUsername = packet.playerName;
          step = "encryption";

          const keyPair = await generateKeys();
          publicKey = keyPair.publicKey;
          privateKey = keyPair.privateKey;
          const bufPublicKey = Buffer.from(publicKey, "utf-8");
          const bufPrivateKey = Buffer.from(privateKey, "utf-8")

          const encryptionPacket = new EncryptionRequestPacket("", bufPublicKey.length, bufPublicKey, bufPrivateKey.length, bufPrivateKey);
          const formattedPacket = PacketHandler.formatUnencryptedPacket(encryptionPacket);
          conn.write(formattedPacket.toBytes());
        } /*else if (step === "encryption" && packet instanceof EncryptionResponsePacket) {
          const HandshakeRes: HandshakeResult = {

          }
        }*/ else if (step === "status" && packet instanceof RequestPacket) {
          step = "ping";
          
          const sampleData = `{"version": {"name": "1.18.2","protocol": 758},"players": {"max": 100,"online": 5,"sample": [{"name": "thinkofdeath","id": "4566e69f-c907-48ee-8d71-d7ba5aa00d20"}]},"description": {"text": "Hello world"}}`;
          const statusPacket = new ResponsePacket(sampleData);
          const formattedPacket = PacketHandler.formatUnencryptedPacket(statusPacket);
          conn.write(formattedPacket.toBytes());
        } else if (step === "ping" && packet instanceof PingPacket) {
          const pongPacket = new PongPacket(packet.payload);
          const formattedPacket = PacketHandler.formatUnencryptedPacket(pongPacket);
          conn.write(formattedPacket.toBytes());
          conn.end();
          resolve(null);
        }
      });
    });
  }
}

function generateKeys(): Promise<{publicKey: string, privateKey: string;}> {
  return new Promise((resolve) => {
    crypto.generateKeyPair("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-128-cbc',
        passphrase: 'top secret'
      }
    }, (err, publicKey, privateKey) => {
      if (err) {
        console.log(err);
        return;
      }
      resolve({
        publicKey: publicKey,
        privateKey: privateKey
      });
    })
  })
}
