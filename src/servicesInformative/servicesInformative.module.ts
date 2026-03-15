import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServicesInformative } from "./entities/servicesInformative.entity";
import { ServicesImage } from "./entities/servicesImage.entity";
import { ServicesInformativeController } from "./servicesInformative.controller";
import { ServicesInformativeService } from "./servicesInformative.service";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ServicesInformative, ServicesImage]),
    RealtimeModule,
  ],
  controllers: [ServicesInformativeController],
  providers: [ServicesInformativeService],
})
export class ServicesInformativeModule {}