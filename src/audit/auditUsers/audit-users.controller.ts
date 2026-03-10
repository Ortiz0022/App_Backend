import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuditUsersService } from './audit-users.service';
import { FindAuditUsersDto } from './dto/find-audit-users.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('audit-users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditUsersController {
  constructor(private readonly auditUsersService: AuditUsersService) {}

  @Get()
  @Roles('ADMIN')
  findAll(@Query() filters: FindAuditUsersDto) {
    return this.auditUsersService.findAll(filters);
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditUsersService.findOne(id);
  }
}