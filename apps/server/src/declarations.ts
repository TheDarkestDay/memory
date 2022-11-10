declare module 'http' {
    export interface IncomingMessage {
        cookies?: Record<string, string>;
    }
}