import EventEmitter from 'events';
import net from 'net';

export default class SocketServer extends EventEmitter {
  private server: net.Server;
  private port: number;
  private running: boolean;

  constructor(port: number) {
    super();
    this.port = port;
    this.server = net.createServer();
    this.running = false;

    this.server.on("connection", (s) => {

      this.emit("connection", s);
      
      s.on("data", (data) => {
        this.emit("data", s, data)
      });

      s.on("close", () => {
        this.emit("close", s);
      });
    });
  }

  public start() {
    this.server.listen(this.port, "0.0.0.0", undefined, () => {
      console.log(`Server listening on port ${this.port}`);
      this.running = true;
    })
  }
}
