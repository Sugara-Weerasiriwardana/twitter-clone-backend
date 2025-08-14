import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { PrismaService } from './prisma.service';

@Injectable()
export class DatabaseIndexesService {
  private readonly logger = new Logger(DatabaseIndexesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional() @InjectConnection() private readonly mongooseConnection?: Connection,
  ) {}

  /**
   * Get PostgreSQL database indexes information
   */
  async getPostgresIndexes() {
    try {
      const indexes = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname;
      `;
      
      return {
        database: 'PostgreSQL',
        indexes: indexes as any[],
        total: (indexes as any[]).length,
      };
    } catch (error) {
      this.logger.error('Failed to get PostgreSQL indexes:', error);
      throw error;
    }
  }

  /**
   * Get MongoDB collection indexes information
   */
  async getMongoIndexes() {
    try {
      if (!this.mongooseConnection) {
        return {
          database: 'MongoDB',
          collections: [],
          total: 0,
          error: 'MongoDB connection not available',
        };
      }

      const collections = await this.mongooseConnection.db.listCollections().toArray();
      const indexesInfo = [];

      for (const collection of collections) {
        const collectionName = collection.name;
        const indexes = await this.mongooseConnection.db
          .collection(collectionName)
          .indexes();
        
        indexesInfo.push({
          collection: collectionName,
          indexes: indexes.map(index => ({
            name: index.name,
            key: index.key,
            unique: index.unique || false,
            sparse: index.sparse || false,
          })),
        });
      }

      return {
        database: 'MongoDB',
        collections: indexesInfo,
        total: indexesInfo.reduce((sum, col) => sum + col.indexes.length, 0),
      };
    } catch (error) {
      this.logger.error('Failed to get MongoDB indexes:', error);
      return {
        database: 'MongoDB',
        collections: [],
        total: 0,
        error: error.message,
      };
    }
  }

  /**
   * Get database performance statistics
   */
  async getDatabaseStats() {
    try {
      // PostgreSQL stats
      const postgresStats = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples
        FROM pg_stat_user_tables
        ORDER BY n_live_tup DESC;
      `;

      // MongoDB stats
      let mongoStats = [];
      if (this.mongooseConnection) {
        try {
          const collections = await this.mongooseConnection.db.listCollections().toArray();
          
          for (const collection of collections) {
            try {
              const stats = await this.mongooseConnection.db
                .collection(collection.name)
                .countDocuments();
              
              mongoStats.push({
                collection: collection.name,
                count: stats,
                size: 0, // Not available without stats()
                avgObjSize: 0, // Not available without stats()
                storageSize: 0, // Not available without stats()
                indexes: 0, // Will get from indexes() method separately
                totalIndexSize: 0, // Not available without stats()
              });
            } catch (error) {
              this.logger.warn(`Failed to get stats for collection ${collection.name}:`, error);
            }
          }
        } catch (mongoError) {
          this.logger.warn('Failed to get MongoDB stats:', mongoError);
        }
      }

      return {
        postgres: {
          tables: postgresStats as any[],
          totalTables: (postgresStats as any[]).length,
        },
        mongodb: {
          collections: mongoStats,
          totalCollections: mongoStats.length,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get database stats:', error);
      throw error;
    }
  }

  /**
   * Check for missing indexes that could improve performance
   */
  async analyzeMissingIndexes() {
    try {
      // Check for potential missing indexes based on common query patterns
      const recommendations = [];

      // PostgreSQL recommendations
      try {
        const slowQueries = await this.prisma.$queryRaw`
          SELECT 
            query,
            calls,
            total_time,
            mean_time,
            rows
          FROM pg_stat_statements
          WHERE mean_time > 100
          ORDER BY mean_time DESC
          LIMIT 10;
        `;

        if ((slowQueries as any[]).length > 0) {
          recommendations.push({
            database: 'PostgreSQL',
            type: 'slow_queries',
            data: slowQueries,
            suggestion: 'Consider adding indexes for frequently slow queries',
          });
        }
      } catch (pgError) {
        this.logger.warn('Failed to analyze PostgreSQL slow queries:', pgError);
      }

      // MongoDB recommendations
      if (this.mongooseConnection) {
        try {
          const collections = await this.mongooseConnection.db.listCollections().toArray();
          for (const collection of collections) {
            try {
              const count = await this.mongooseConnection.db
                .collection(collection.name)
                .countDocuments();
              
              const indexes = await this.mongooseConnection.db
                .collection(collection.name)
                .indexes();
              
              if (count > 10000 && indexes.length < 3) {
                recommendations.push({
                  database: 'MongoDB',
                  collection: collection.name,
                  type: 'missing_indexes',
                  suggestion: `Collection ${collection.name} has ${count} documents but only ${indexes.length} indexes. Consider adding indexes for frequently queried fields.`,
                });
              }
            } catch (error) {
              this.logger.warn(`Failed to analyze collection ${collection.name}:`, error);
            }
          }
        } catch (mongoError) {
          this.logger.warn('Failed to analyze MongoDB indexes:', mongoError);
        }
      }

      return {
        recommendations,
        total: recommendations.length,
      };
    } catch (error) {
      this.logger.error('Failed to analyze missing indexes:', error);
      return {
        recommendations: [],
        total: 0,
        error: error.message,
      };
    }
  }

  /**
   * Get comprehensive database health report
   */
  async getDatabaseHealthReport() {
    try {
      const [indexes, stats, missingIndexes] = await Promise.all([
        this.getPostgresIndexes(),
        this.getDatabaseStats(),
        this.analyzeMissingIndexes(),
      ]);

      return {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        databases: {
          postgres: {
            status: 'connected',
            indexes: indexes.total,
            tables: stats.postgres.totalTables,
          },
          mongodb: {
            status: this.mongooseConnection ? 'connected' : 'not_available',
            indexes: stats.mongodb.totalCollections,
            collections: stats.mongodb.totalCollections,
          },
        },
        performance: {
          recommendations: missingIndexes.recommendations,
          totalRecommendations: missingIndexes.total,
        },
        summary: {
          totalIndexes: indexes.total + stats.mongodb.totalCollections,
          totalTables: stats.postgres.totalTables + stats.mongodb.totalCollections,
          healthScore: this.calculateHealthScore(indexes.total, stats.postgres.totalTables, stats.mongodb.totalCollections),
        },
      };
    } catch (error) {
      this.logger.error('Failed to generate database health report:', error);
      return {
        timestamp: new Date().toISOString(),
        status: 'error',
        error: error.message,
      };
    }
  }

  private calculateHealthScore(indexes: number, tables: number, collections: number): number {
    // Simple health score calculation
    const totalEntities = tables + collections;
    const indexRatio = indexes / Math.max(totalEntities, 1);
    
    if (indexRatio >= 0.8) return 95; // Excellent
    if (indexRatio >= 0.6) return 80; // Good
    if (indexRatio >= 0.4) return 65; // Fair
    if (indexRatio >= 0.2) return 50; // Poor
    return 30; // Very Poor
  }
}
