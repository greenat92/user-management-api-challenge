import { Injectable } from '@nestjs/common';

// we can implement it using cache like redis this is just to demonstrate how to kill tokens after logout.
// for production solution of course we should have a propre solution.
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
