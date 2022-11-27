declare module NodeJS {
  export interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly NX_APP_DOMAIN: string;
    readonly NX_SET_COOKIE_DOMAIN: string;
    readonly NX_SERVER_PORT: string;
  }
}