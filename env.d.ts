declare global {
  namespace NodeJS {
    interface ProcessEnv {
      APP_ENV: 'dev' | 'staging' | 'production' | 'local' | 'test';
      // test types
      TEST_TYPE: 'SMOKE' | 'E2E' | 'UNIT';

      // performance measuring
      PERFORMANCE_MEASURING_ENABLED: 'true' | 'false';

      // server
      HOST: string;
      PORT: number;

      // Database
      DB_URI: string;
      DB_NAME: string;
      DATABASE_CONFIG: string;

      // Testing db

      DB_URI_TESTING: string;
      DB_NAME_TESTING: string;

      // app name
      APP_NAME: string;
      APP_URL: string;

      // tokens
      ACCESS_TOKEN_SECRET: string;
      REFRESH_TOKEN_SECRET: string;
      ACCESS_TOKEN_EXPIRE_TIME: string;
      REFRESH_TOKEN_EXPIRE_TIME: string;

      // logs
      LOG_LEVEL: string;
    }
  }
}

export {};
