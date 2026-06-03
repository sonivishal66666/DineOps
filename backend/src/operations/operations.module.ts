import { Module } from '@nestjs/common';
import { OperationsService } from './operations.service';
import { OperationsController } from './operations.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [OperationsService],
  controllers: [OperationsController],
  exports: [OperationsService],
})
export class OperationsModule {}
