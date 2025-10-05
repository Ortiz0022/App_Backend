// import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

// import { CreateCorrienteDto } from './dto/create-corriente.dto';
// import { UpdateCorrienteDto } from './dto/update-corriente.dto';
// import { CorrienteElectricaService } from './corriente.service';

// @Controller('corriente-electrica')
// export class CorrienteElectricaController {
//   constructor(private readonly service: CorrienteElectricaService) {}

//   @Post()
//   create(@Body() dto: CreateCorrienteDto) {
//     return this.service.create(dto);
//   }

//   @Get()
//   findAll() {
//     return this.service.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id', ParseIntPipe) id: number) {
//     return this.service.findOne(id);
//   }

//   @Patch(':id')
//   update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCorrienteDto) {
//     return this.service.update(id, dto);
//   }

//   @Delete(':id')
//   remove(@Param('id', ParseIntPipe) id: number) {
//     return this.service.remove(id);
//   }
// }
