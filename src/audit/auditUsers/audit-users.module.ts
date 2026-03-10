import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditUser } from './entities/audit-users.entity';
import { AuditUsersService } from './audit-users.service';
import { AuditUsersController } from './audit-users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditUser])],
  controllers: [AuditUsersController],
  providers: [AuditUsersService],
  exports: [AuditUsersService],
})
export class AuditUsersModule {}