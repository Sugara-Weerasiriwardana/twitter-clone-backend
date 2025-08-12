import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@WebSocketGateway({
  cors: { origin: true }, // tighten in prod
  path: '/socket.io',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  // Map userId -> Set of socketIds (multiple devices)
  private users = new Map<string, Set<string>>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Expect token in handshake auth: { token: "..." } OR Authorization header
      const token =
        (client.handshake.auth && client.handshake.auth.token) ||
        (client.handshake.headers && (client.handshake.headers.authorization as string)?.split(' ')[1]);

      if (!token) {
        this.logger.warn(`Socket ${client.id} attempted to connect without token`);
        client.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      const userId = payload?.sub;
      if (!userId) {
        this.logger.warn(`Socket ${client.id} invalid token payload`);
        client.disconnect(true);
        return;
      }

      // attach userId to socket for reference
      (client as any).data = { userId };

      // register socket
      const sockets = this.users.get(userId) ?? new Set<string>();
      sockets.add(client.id);
      this.users.set(userId, sockets);

      this.logger.log(`User ${userId} connected with socket ${client.id}`);
    } catch (err) {
      this.logger.warn(`Socket ${client.id} failed auth: ${err?.message || err}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).data?.userId;
    if (!userId) return;

    const sockets = this.users.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) this.users.delete(userId);
      else this.users.set(userId, sockets);
    }

    this.logger.log(`User ${userId} disconnected from socket ${client.id}`);
  }

  // method other services can call to notify a user
  sendNotificationToUser(userId: string, payload: any) {
  const sockets = this.users.get(userId);
  if (!sockets || sockets.size === 0) {
    this.logger.warn(`No active sockets found for userId: ${userId}`);
    return;
  }

  this.logger.log(`Sending notification to userId: ${userId} on sockets: ${[...sockets].join(',')}`);

  for (const socketId of sockets) {
    this.logger.log(`Payload: ${JSON.stringify(payload)}`);
    this.server.to(socketId).emit('notification', payload);
  }
}


  // optionally broadcast to all (for admin events)
  broadcast(payload: any) {
    this.server.emit('notification', payload);
  }
}
