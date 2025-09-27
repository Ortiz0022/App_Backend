import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { PSpendSubTypeService } from './p-spend-sub-type.service';

@Controller('p-spend-sub-type')
export class PSpendSubTypeController {
  constructor(private readonly svc: PSpendSubTypeService) {}

  // GET /p-spend-sub-type?departmentId=2&typeId=5&fiscalYearId=1
  @Get()
  list(
    @Query('departmentId') departmentId?: string,
    @Query('typeId') typeId?: string,
    @Query('fiscalYearId') fiscalYearId?: string,
  ) {
    return this.svc.findAll(
      departmentId ? Number(departmentId) : undefined,
      typeId ? Number(typeId) : undefined,
      fiscalYearId ? Number(fiscalYearId) : undefined,
    );
  }

  @Post()
  create(@Body() dto: { name: string; typeId: number }) {
    return this.svc.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { name?: string; typeId?: number },
  ) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
