import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ServicesInformativeService } from "./servicesInformative.service";
import { ServicesInformativeDto } from "./dto/ServicesInformativeDto";

@Controller('servicesInformative')
export class ServicesInformativeController {

    constructor(private servicesInformativeService: ServicesInformativeService) {}

    @Post()
    create(@Body() createServicesInformativeDto: ServicesInformativeDto) {
        return this.servicesInformativeService.createServicesInformative(createServicesInformativeDto);
    }

    @Get()
    findAll() {
        return this.servicesInformativeService.findAllServicesInformative();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.servicesInformativeService.findOneServicesInformative(id);      
    }   

    @Put(':id')
    update(@Param('id') id: number, @Body() updateServicesInformativeDto: ServicesInformativeDto) {
        return this.servicesInformativeService.updateServicesInformative(id, updateServicesInformativeDto);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.servicesInformativeService.deleteServicesInformative(id);
    }   
}