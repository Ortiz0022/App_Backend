// src/transfer/transfer.controller.ts
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/createTransferDto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransferController {
  constructor(private readonly service: TransferService) {}

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: CreateTransferDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

}
