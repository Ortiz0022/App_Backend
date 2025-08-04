import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { AboutUsService } from "./aboutUs.service";
import { AboutUs } from "./entities/aboutUs.entity";
import { AboutUsDto } from "./dto/AboutUsDto";

@Controller('aboutUs')
export class AboutUsController {

    constructor(private aboutUsService: AboutUsService) {}

    @Post()
    create(@Body() createAboutUsDto: AboutUsDto) {
        return this.aboutUsService.createAboutUs(createAboutUsDto);
    }

    @Get()
    findAll() {
        return this.aboutUsService.findAllAboutUs();
    }

    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.aboutUsService.findOneAboutUs(id);
    }
    
    @Put(':id')
    update(@Param('id') id: number, @Body() updateAboutUsDto: AboutUs) {
        return this.aboutUsService.updateAboutUs(id, updateAboutUsDto);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.aboutUsService.deleteAboutUs(id);
    }   
}