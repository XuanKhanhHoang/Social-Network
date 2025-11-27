import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, Logger } from '@nestjs/common';
import * as cookie from 'cookie';
import { UpdateUserIpLocationService } from '../use-case/ip-location-tracking/update-user-ip-location/update-user-ip-location.service';

import { SocketEvents } from 'src/share/constants/socket.constant';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
@Injectable()
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly updateUserIpLocationService: UpdateUserIpLocationService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const cookies = cookie.parse(client.handshake.headers.cookie || '');
      const token = cookies['accessToken'];

      if (!token) {
        this.logger.warn(`Connection attempt without token from ${client.id}`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);

      client.data.user = payload;
      const userId = payload._id || payload.sub;

      if (!userId) {
        this.logger.warn(
          `Token payload missing userId: ${JSON.stringify(payload)}`,
        );
        client.disconnect();
        return;
      }

      await client.join(`user_${userId}`);

      const ip =
        client.handshake.address || client.handshake.headers['x-forwarded-for'];
      const ipStr = Array.isArray(ip) ? ip[0] : ip;

      if (userId && ipStr) {
        this.updateUserIpLocationService
          .execute({
            userId,
            ip: ipStr,
          })
          .catch((err) => {
            this.logger.error(`Failed to update user IP: ${err.message}`);
          });
      }

      this.logger.log(`Client connected: ${userId} (${client.id})`);
    } catch (error) {
      this.logger.warn(`Connection unauthorized: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  async sendToUser(userId: string, payload: any) {
    const roomName = `user_${userId}`;
    this.server.to(roomName).emit(SocketEvents.NEW_NOTIFICATION, payload);
  }
}
