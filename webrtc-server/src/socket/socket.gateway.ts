import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateSocketDto } from './dto/create-socket.dto';

@WebSocketGateway(4000, {
  namespace: 'webrtc',
  transports: ['websocket'],
  cors: {
    origin: '*',
  },
})
export class SocketGateway {
  @WebSocketServer()
  private readonly server: Server;

  // 客户端 ID 映射表
  private clientIdMap: Map<string, string> = new Map();
  // 当前通话的用户列表
  // private roomUsersMap: Map<string, string> = new Map();

  @SubscribeMessage('connection')
  handleConnection(client: Socket) {
    const { userId } = client.handshake.query;
    if (!userId) return;
    this.clientIdMap.set(userId as string, client.id);
    // TODo:如果不小心断线重连，则需要重新加入房间
    // if (this.roomUsersMap.has(userId as string)) {
    //   console.log('重新上线或者断线重连');
    // }
    this.server.emit('online-users', Array.from(this.clientIdMap.keys()));
  }

  @SubscribeMessage('disconnect')
  handleDisconnect(client: Socket) {
    const { userId } = client.handshake.query;
    if (!userId) return;
    this.clientIdMap.delete(userId as string);
    this.server.emit('online-users', Array.from(this.clientIdMap.keys()));
  }

  @SubscribeMessage('join-room')
  joinRoom(
    @MessageBody() data: Omit<CreateSocketDto, 'userIds'> & { userId: string },
  ) {
    this.server.socketsJoin(data.roomId);
    // this.roomUsersMap.set(data.userId, data.roomId);
    console.log(`[SocketGateway] 客户端加入房间ID: ${data.roomId}`);
  }

  @SubscribeMessage('start-call')
  startCall(@MessageBody() data: CreateSocketDto) {
    console.log('[SocketGateway] 呼叫用户：', data.userIds);
    data.userIds.forEach((userId) => {
      const clientId = this.clientIdMap.get(userId);
      if (!clientId) return;
      // 通过客户端连接 id 发送消息
      this.server.to(clientId).emit('start-call', data);
    });
  }

  @SubscribeMessage('end-call')
  endCall(@MessageBody() data: CreateSocketDto) {
    console.log('[SocketGateway] 结束呼叫', data.userIds);
    // 通知房间内其他人
    this.server.to(data.roomId).emit('end-call');
  }
}
