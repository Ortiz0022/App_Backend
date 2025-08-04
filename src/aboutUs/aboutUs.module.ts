import { Module } from "@nestjs/common";
import { AboutUsService } from "./aboutUs.service";
import { AboutUsController } from "./aboutUs.controller";
import { AboutUs } from "./entities/aboutUs.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([AboutUs])],
    controllers: [AboutUsController],
    providers: [AboutUsService],
})
export class AboutUsModule {}