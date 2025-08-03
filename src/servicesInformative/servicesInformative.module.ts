import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ServicesInformative } from "./entities/servicesInformative.entity";
import { ServicesInformativeController } from "./servicesInformative.controller";
import { ServicesInformativeService } from "./servicesInformative.service";

@Module({
  imports: [TypeOrmModule.forFeature([ServicesInformative])],
  controllers: [ServicesInformativeController],
  providers: [ServicesInformativeService],
})
export class ServicesInformativeModule {}