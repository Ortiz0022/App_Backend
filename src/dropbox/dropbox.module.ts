import { Module } from '@nestjs/common';
import { DropboxService } from './dropbox.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [DropboxService],
  exports: [DropboxService],
})
export class DropboxModule {}