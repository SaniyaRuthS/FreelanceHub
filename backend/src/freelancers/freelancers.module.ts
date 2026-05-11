import { Module } from '@nestjs/common';
import { FreelancersController } from './freelancers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FreelancersController],
})
export class FreelancersModule {}
