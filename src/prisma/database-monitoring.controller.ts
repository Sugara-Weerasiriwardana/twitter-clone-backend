import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DatabaseIndexesService } from './database-indexes.service';

@ApiTags('database-monitoring')
@Controller('database')
export class DatabaseMonitoringController {
  constructor(private readonly databaseIndexesService: DatabaseIndexesService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get comprehensive database health report' })
  @ApiResponse({ 
    status: 200, 
    description: 'Database health report retrieved successfully',
    schema: {
      example: {
        timestamp: '2024-01-01T00:00:00.000Z',
        status: 'healthy',
        databases: {
          postgres: { status: 'connected', indexes: 15, tables: 4 },
          mongodb: { status: 'connected', indexes: 8, collections: 3 }
        },
        performance: {
          recommendations: [],
          totalRecommendations: 0
        },
        summary: {
          totalIndexes: 23,
          totalTables: 7,
          healthScore: 95
        }
      }
    }
  })
  async getDatabaseHealth() {
    return this.databaseIndexesService.getDatabaseHealthReport();
  }

  @Get('indexes/postgres')
  @ApiOperation({ summary: 'Get PostgreSQL database indexes information' })
  @ApiResponse({ 
    status: 200, 
    description: 'PostgreSQL indexes information retrieved successfully' 
  })
  async getPostgresIndexes() {
    return this.databaseIndexesService.getPostgresIndexes();
  }

  @Get('indexes/mongodb')
  @ApiOperation({ summary: 'Get MongoDB collection indexes information' })
  @ApiResponse({ 
    status: 200, 
    description: 'MongoDB indexes information retrieved successfully' 
  })
  async getMongoIndexes() {
    return this.databaseIndexesService.getMongoIndexes();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get database performance statistics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Database statistics retrieved successfully' 
  })
  async getDatabaseStats() {
    return this.databaseIndexesService.getDatabaseStats();
  }

  @Get('analysis/missing-indexes')
  @ApiOperation({ summary: 'Analyze missing indexes for performance improvement' })
  @ApiResponse({ 
    status: 200, 
    description: 'Missing indexes analysis completed successfully' 
  })
  async analyzeMissingIndexes() {
    return this.databaseIndexesService.analyzeMissingIndexes();
  }
}
