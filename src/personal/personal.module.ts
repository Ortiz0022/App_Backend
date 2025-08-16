import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Personal } from './entities/personal.entity';
import { PersonalService } from './personal.service';
import { PersonalController } from './personal.controller';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Personal, User])],
  controllers: [PersonalController],
  providers: [PersonalService],
})
export class PersonalModule {}
