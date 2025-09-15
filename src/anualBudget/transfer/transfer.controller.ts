// src/transfer/transfer.controller.ts
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/createTransferDto';

@Controller('transfers')
export class TransferController {
  constructor(private readonly service: TransferService) {}

  @Post()
  create(@Body() dto: CreateTransferDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

}
