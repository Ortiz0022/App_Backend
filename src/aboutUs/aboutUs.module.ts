import { Module } from "@nestjs/common";
import { AboutUsService } from "./aboutUs.service";
import { AboutUsController } from "./aboutUs.controller";
import { AboutUs } from "./entities/aboutUs.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
    imports: [TypeOrmModule.forFeature([AboutUs]), RealtimeModule],
    controllers: [AboutUsController],
    providers: [AboutUsService],
})
export class AboutUsModule {}