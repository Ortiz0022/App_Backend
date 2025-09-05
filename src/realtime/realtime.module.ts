import { Module } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

@Module({
  providers: [RealtimeGateway],
  exports: [RealtimeGateway], // para inyectarlo en servicios
})
export class RealtimeModule {}
