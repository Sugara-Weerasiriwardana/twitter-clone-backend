import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache
  ) {}

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
    await this.cacheManager.del(pattern);
  }

  async cacheFeed(userId: string, posts: any[], ttl = 300) {
    const key = `feed:${userId}`;
    await this.cacheManager.set(key, posts, ttl);
  }

  async getFeed(userId: string) {
    const key = `feed:${userId}`;
    return await this.cacheManager.get(key);
  }
} 