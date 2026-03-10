import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { AuditBudgetService } from './audit-budget.service';
import { FindAuditBudgetDto } from './dto/find-audit-budget.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('audit-budget')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditBudgetController {
  constructor(private readonly auditBudgetService: AuditBudgetService) {}

  @Get()
  @Roles('ADMIN')
  findAll(@Query() filters: FindAuditBudgetDto) {
    return this.auditBudgetService.findAll(filters);
  }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditBudgetService.findOne(id);
  }
}