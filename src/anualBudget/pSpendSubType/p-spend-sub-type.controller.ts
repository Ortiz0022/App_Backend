import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PSpendSubTypeService } from './p-spend-sub-type.service';
import { CreatePSpendSubTypeDto } from './dto/create.dto';
import { UpdatePSpendSubTypeDto } from './dto/update.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('p-spend-sub-type')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PSpendSubTypeController {
  constructor(private readonly svc: PSpendSubTypeService) {}

  @Post() 
  @Roles('ADMIN') 
  create(@Body() dto: CreatePSpendSubTypeDto) { return this.svc.create(dto); }

  @Get() 
  list(@Query('typeId') typeId?: number) {
    return this.svc.findAll(typeId ? Number(typeId) : undefined);
  }
  @Get(':id') 
  one(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }

  @Patch(':id') 
  @Roles('ADMIN') 
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePSpendSubTypeDto) 
  { return this.svc.update(id, dto); }

  @Delete(':id') 
  @Roles('ADMIN') 
  remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
