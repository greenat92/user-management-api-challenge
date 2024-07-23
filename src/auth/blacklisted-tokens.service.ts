import { Injectable } from '@nestjs/common';

// we can implement it using cache this is just to demonstrate how to kill tokens after logout.
@Injectable()
export class BlacklistedTokensService {
  private readonly blacklistedTokens = new Set<string>();

  addToken(token: string): void {
    this.blacklistedTokens.add(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }
}