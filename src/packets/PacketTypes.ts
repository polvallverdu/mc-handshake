export enum PacketBound {
  SERVER, 
  CLIENT
}

export type PacketState = "HANDSHAKE" | "STATUS" | "LOGIN" | "PLAY";