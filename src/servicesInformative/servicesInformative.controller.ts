import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ServicesInformativeService } from "./servicesInformative.service";
import { ServicesInformativeDto } from "./dto/ServicesInformativeDto";
import { Roles } from "src/auth/roles.decorator";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";
import { RolesGuard } from "src/auth/roles.guard";
import { Public } from "src/auth/public.decorator";

@Controller('servicesInformative')
export class ServicesInformativeController {

    constructor(private servicesInformativeService: ServicesInformativeService) {}
    @Post()
    @Roles('ADMIN')
    create(@Body() createServicesInformativeDto: ServicesInformativeDto) {
        return this.servicesInformativeService.create(createServicesInformativeDto);
    }
    @Public()
    @Get()
    findAll() {
        return this.servicesInformativeService.findAll();
    }
    @Public()
    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.servicesInformativeService.findOne(id);
    }
    @Put(':id')
    @Roles('ADMIN') 
    update(@Param('id') id: number, @Body() updateServicesInformativeDto: ServicesInformativeDto) {
        return this.servicesInformativeService.update(id, updateServicesInformativeDto);
    }
    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.servicesInformativeService.delete(id);
    }   
}