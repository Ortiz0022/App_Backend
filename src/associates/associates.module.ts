import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from '@nestjs/common';
import { AssociateController } from "./associates.controller";
import { Associate } from "./entities/associates.entity";
import { AssociateService } from "./associates.service";

@Module({
  imports: [TypeOrmModule.forFeature([Associate])],
  controllers: [AssociateController],
  providers: [AssociateService],
})
export class AssociateModule {}
