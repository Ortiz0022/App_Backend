import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ServicesInformativeService } from "./servicesInformative.service";
import { ServicesInformativeDto } from "./dto/ServicesInformativeDto";

@Controller('servicesInformative')
export class ServicesInformativeController {

    constructor(private servicesInformativeService: ServicesInformativeService) {}

    @Post()
    create(@Body() createServicesInformativeDto: ServicesInformativeDto) {
        return this.servicesInformativeService.create(createServicesInformativeDto);
    }

    @Get()
    findAll() {
        return this.servicesInformativeService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.servicesInformativeService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() updateServicesInformativeDto: ServicesInformativeDto) {
        return this.servicesInformativeService.update(id, updateServicesInformativeDto);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.servicesInformativeService.delete(id);
    }   
}