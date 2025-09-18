import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete } from '@nestjs/common';
import { IncomeTypeService } from './income-type.service';
import { CreateIncomeTypeDto } from './dto/createIncomeTypeDto';
import { UpdateIncomeTypeDto } from './dto/updateIncomeTypeDto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('income-type')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IncomeTypeController {
  constructor(private readonly service: IncomeTypeService) {}

  @Post() 
  @Roles('ADMIN') 
  create(@Body() dto: CreateIncomeTypeDto) { return this.service.create(dto); }

  @Get()
  findAll() { return this.service.findAll(); }

  @Get(':id') 
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  
  @Patch(':id')
  @Roles('ADMIN') 
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateIncomeTypeDto) {
    return this.service.update(id, dto);
  }
  @Delete(':id') 
  @Roles('ADMIN') 
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
