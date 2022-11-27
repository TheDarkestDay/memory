import { resolve } from 'path';
import { IncomingMessage } from 'http';
import { readFileSync } from 'fs';
import ws from '@fastify/websocket';
import fastify from 'fastify';
import staticFiles from '@fastify/static';
import cookie from '@fastify/cookie';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { createRouterWithContext } from '@memory/shared';

import './declarations';
import { Context, createContext } from './context';
import { inMemoryGameManager } from './game/in-memory-game-manager';

const isProduction = process.env.NODE_ENV === 'production';
const envSuppliedPort = isProduction ? process['en' + 'v']['PORT'] : process.env.NX_SERVER_PORT;
const port = envSuppliedPort || '3001';

let httpsConfig;

if (!isProduction) {
  httpsConfig = {
    key: readFileSync(
      './apps/server/certs/local-server.thedarkestday-memory.com-key.pem'
    ),
    cert: readFileSync(
      './apps/server/certs/local-server.thedarkestday-memory.com.pem'
    ),
  };
}

const server = fastify({
  maxParamLength: 5000,
  logger: true,
  https: httpsConfig,
});

server.register(cookie);

const appRouter = createRouterWithContext<Context>(inMemoryGameManager);

server.register(ws, {
  options: {
    verifyClient: ({req}: {req: IncomingMessage}, next) => {
      const rawCookie = req.headers.cookie;

      if (rawCookie == null) {
        return next(false);
      }

      req.cookies = server.parseCookie(rawCookie);

      next(true);
    }
  }
});

server.register(fastifyTRPCPlugin, {
  useWSS: true,
  prefix: '/trpc',
  trpcOptions: { router: appRouter, createContext },
});

server.setErrorHandler((error) => {
  server.log.error(error);
});

(async () => {
  if (isProduction) {
    await server.register(staticFiles, {
      root: resolve('./dist/apps/frontend'),
      wildcard: false,
    });

    server.get('*', (_request, reply) => {
      reply.sendFile('index.html');
    });
  }

  try {
    await server.listen({ port: Number(port), host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
