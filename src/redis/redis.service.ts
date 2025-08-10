import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

  // Test method to verify Redis is working
  async testRedisConnection() {
    try {
      await this.cacheManager.set('test_connection', 'Redis is working!', 60);
      const result = await this.cacheManager.get('test_connection');
      return {
        success: true,
        message: 'Redis connection test passed',
        result: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Redis connection test failed',
        error: error.message
      };
    }
  }

  // Cache trending hashtags
  async cacheTrendingHashtags(hashtags: any[], ttl = 300) {
    await this.cacheManager.set('trending_hashtags', hashtags, ttl);
  }

  async getTrendingHashtags() {
    return await this.cacheManager.get('trending_hashtags');
  }

  // Cache user posts
  async cacheUserPosts(userId: string, posts: any[], ttl = 600) {
    const key = `user_posts:${userId}`;
    await this.cacheManager.set(key, posts, ttl);
  }

  async getUserPosts(userId: string) {
    const key = `user_posts:${userId}`;
    return await this.cacheManager.get(key);
  }

  // Cache poll results
  async cachePollResults(pollId: string, results: any, ttl = 300) {
    const key = `poll_results:${pollId}`;
    await this.cacheManager.set(key, results, ttl);
  }

  async getPollResults(pollId: string) {
    const key = `poll_results:${pollId}`;
    return await this.cacheManager.get(key);
  }

  // Cache search results
  async cacheSearchResults(query: string, results: any, ttl = 300) {
    const key = `search:${query}`;
    await this.cacheManager.set(key, results, ttl);
  }

  async getSearchResults(query: string) {
    const key = `search:${query}`;
    return await this.cacheManager.get(key);
  }

  // Rate limiting
  async incrementRateLimit(key: string, ttl = 60) {
    const current = await this.cacheManager.get(key) || 0;
    const newValue = Number(current) + 1;
    await this.cacheManager.set(key, newValue, ttl);
    return newValue;
  }

  async getRateLimit(key: string) {
    return await this.cacheManager.get(key) || 0;
  }

  // Clear cache
  async clearCache(pattern: string) {
    // Note: This is a simplified version. In production, you'd use Redis SCAN
    await this.cacheManager.del(pattern);
  }

  // Cache post feed
  async cacheFeed(key: string, data: any, ttl = 300) {
    await this.cacheManager.set(key, data, ttl);
  }

  async getFeed(key: string) {
    return await this.cacheManager.get(key);
  }

  // Get cache statistics
  async getCacheStats() {
    try {
      const testKey = 'cache_stats_test';
      await this.cacheManager.set(testKey, 'test_value', 60);
      const result = await this.cacheManager.get(testKey);
      await this.cacheManager.del(testKey);
      
      return {
        status: 'healthy',
        message: 'Cache is working properly',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Cache is not working',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
} 