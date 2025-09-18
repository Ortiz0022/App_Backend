import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { PIncomeTypeService } from './pincome-type.service';
import { CreatePIncomeTypeDto } from './dto/createPIncomeTypeDto';
import { UpdatePIncomeTypeDto } from './dto/updatePIncomeTypeDto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('p-income-type')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PIncomeTypeController {
  constructor(private readonly svc: PIncomeTypeService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreatePIncomeTypeDto) {
    return this.svc.create(dto);
  }

  @Get()
  list() {
    return this.svc.findAll();
  }

  @Get(':id')
  get(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePIncomeTypeDto) {
    return this.svc.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
