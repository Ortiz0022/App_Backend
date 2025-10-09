import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DropboxAuthController } from './dropbox-auth.controller';

@Module({
  imports: [ConfigModule],
  controllers: [DropboxAuthController],
})
export class DropboxAuthModule {}