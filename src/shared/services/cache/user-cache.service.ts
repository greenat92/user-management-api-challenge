import { Injectable } from '@nestjs/common';
import * as NodeCache from 'node-cache';
import { IUser } from '../../../users/users.interface';

@Injectable()
export class UserCacheService {
  // it's better to user redis cache server for keep data persistence, but for the challenge i will use node-cache in memory tool
  private cache: NodeCache;

  constructor() {
    this.cache = new NodeCache({ stdTTL: 86400 }); // Set default TTL to 1 day (86400 seconds)
  }

  setUserCache(cacheKey: number | string, data: Partial<IUser>): void {
    const key = this.generateCacheKey(cacheKey);
    this.cache.set(key, data);
  }

  async getUserCache(cacheKey: number | string): Promise<Partial<IUser>> {
    const key = this.generateCacheKey(cacheKey);
    return this.cache.get<Partial<IUser>>(key);
  }

  invalidateUserCache(cacheKey: number | string): void {
    const key = this.generateCacheKey(cacheKey);
    this.cache.del(key);
  }

  generateCacheKey(cacheKey: number | string): string {
    return `user_${cacheKey}`;
  }
}
