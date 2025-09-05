import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({
    namespace: '/rt',  // namespace que usarás en el frontend
    cors: {
      origin: [
        'http://localhost:5174', // admin
        'http://localhost:5173', // informativo
      ],
      credentials: true,
      methods: ['GET', 'POST'],
    },
  })
  export class RealtimeGateway {
    @WebSocketServer() server: Server;
  
    afterInit(server: Server) {
      console.log('Realtime WS init');
    }
  
    handleConnection(client: Socket) {
      console.log(`Cliente conectado: ${client.id}`);
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Cliente desconectado: ${client.id}`);
    }
  
    // ---- Canal de prueba ----
    @SubscribeMessage('ping')
    handlePing(@ConnectedSocket() client: Socket, @MessageBody() data?: any) {
      client.emit('pong', { ok: true, at: Date.now() });
    }
  
    // ---- Canales para tus módulos ----
    emitFaqUpdated(payload: any) {
      this.server.emit('faq:updated', payload);
    }
  
    emitEventUpdated(payload: any) {
      this.server.emit('event:updated', payload);
    }

    emitServiceUpdated(payload: any) {
      this.server.emit('service:updated', payload);
    }
  
    emitPersonalUpdated(payload: any) {
      this.server.emit('personal:updated', payload);
    }
  
    emitContentUpdated(payload: any) {
      this.server.emit('content:updated', payload);
    }

    emitAboutUsUpdated(payload: any) {
      this.server.emit('aboutUs:updated', payload);
    }

    emitPrincipalUpdated(payload: any) {
      this.server.emit('principal:updated', payload);
    }
  }
  