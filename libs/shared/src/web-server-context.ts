export type WebServerContext = {
  playerId?: string;
  setCookie(name: string, value: any): void;
};