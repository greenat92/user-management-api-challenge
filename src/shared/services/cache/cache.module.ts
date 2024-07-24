import { Module, Global } from '@nestjs/common';
import { UserCacheService } from './user-cache.service';

@Global()
@Module({
  providers: [UserCacheService],
  exports: [UserCacheService],
})
export class CacheModule {}
