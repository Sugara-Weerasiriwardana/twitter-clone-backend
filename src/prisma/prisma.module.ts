import { Module } from '@nestjs/common';
import { DatabaseIndexesService } from './database-indexes.service';
import { DatabaseMonitoringController } from './database-monitoring.controller';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService, DatabaseIndexesService],
  exports: [PrismaService, DatabaseIndexesService],
  controllers: [DatabaseMonitoringController],
})
export class PrismaModule {}
