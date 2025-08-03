import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from '@nestjs/common';
import { AssociateController } from "./associates.controller";
import { AssociateService } from "./associates.service";
import { Associate } from "./entities/associates.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Associate])],
  controllers: [AssociateController],
  providers: [AssociateService],
})
export class AssociateModule {}

