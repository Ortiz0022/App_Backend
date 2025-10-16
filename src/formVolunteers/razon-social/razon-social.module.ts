import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RazonSocialService } from './razon-social.service';
import { RazonSocialController } from './razon-social.controller';
import { RazonSocial } from './entities/razon-social.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RazonSocial])],
  controllers: [RazonSocialController],
  providers: [RazonSocialService],
  exports: [RazonSocialService, TypeOrmModule],
})
export class RazonSocialModule {}