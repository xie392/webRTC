import {
  ManagerOptions,
  SocketOptions,
  io,
  Socket as SocketIO,
} from "socket.io-client";

class Socket {
  private socket: SocketIO;

  constructor(url: string, opts: Partial<ManagerOptions & SocketOptions>) {
    this.socket = io(url, {
      ...opts,
    });
  }
}

export default Socket;
