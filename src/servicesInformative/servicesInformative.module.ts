import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServicesInformative } from "./entities/servicesInformative.entity";
import { ServicesInformativeController } from "./servicesInformative.controller";
import { ServicesInformativeService } from "./servicesInformative.service";
import { RealtimeModule } from "../realtime/realtime.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ServicesInformative]),
    RealtimeModule
  ],
  controllers: [ServicesInformativeController],
  providers: [ServicesInformativeService],
})
export class ServicesInformativeModule {}