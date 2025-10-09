import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Dropbox } from 'dropbox';
import { DropboxService } from './dropbox.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'DROPBOX',
      useFactory: async (configService: ConfigService) => {
        const refreshToken = configService.get<string>('DROPBOX_REFRESH_TOKEN');
        const clientId = configService.get<string>('DROPBOX_APP_KEY');
        const clientSecret = configService.get<string>('DROPBOX_APP_SECRET');

        if (!refreshToken) {
          console.warn('⚠️ DROPBOX_REFRESH_TOKEN no configurado');
          return null;
        }

        return new Dropbox({
          clientId,
          clientSecret,
          refreshToken,
        });
      },
      inject: [ConfigService],
    },
    DropboxService,
  ],
  exports: [DropboxService, 'DROPBOX'],
})
export class DropboxModule {}