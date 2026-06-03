import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { MockDbService } from './mock-db.service';

@Global()
@Module({
  providers: [PrismaService, MockDbService],
  exports: [PrismaService, MockDbService],
})
export class PrismaModule {}
