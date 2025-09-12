//// src/transfer/transfer.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/createTransferDto';
import { UpdateTransferDto } from './dto/updateTransferDto';
import { FilterTransferDto } from './dto/filterTransferDto';

@Controller('transfer')
export class TransferController {
  constructor(private readonly service: TransferService) {}

  // @Post()
  // create(@Body() dto: CreateTransferDto) {
  //   return this.service.create(dto);
  // }

  @Get()
  findAll(@Query() filter: FilterTransferDto) {
    return this.service.findAll(filter);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTransferDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
