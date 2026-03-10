import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditBudget } from './entities/audit-budget.entity';
import { AuditBudgetService } from './audit-budget.service';
import { AuditBudgetController } from './audit-budget.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditBudget])],
  controllers: [AuditBudgetController],
  providers: [AuditBudgetService],
  exports: [AuditBudgetService],
})
export class AuditBudgetModule {}