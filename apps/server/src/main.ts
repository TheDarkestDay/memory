import { resolve } from 'path';
import { readFileSync } from 'fs';
import ws from '@fastify/websocket';
import fastify from 'fastify';
import cors from '@fastify/cors';
import staticFiles from '@fastify/static';
import cookie from '@fastify/cookie';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { createRouterWithContext } from '@memory/shared';

import { Context, createContext } from './context';
import { inMemoryGameManager } from './game/in-memory-game-manager';

const PORT = Number(process.env.NX_SERVER_PORT) || 3001;

let httpsConfig;

if (process.env.NODE_ENV === 'development') {
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

server.register(ws);

server.register(fastifyTRPCPlugin, {
  useWSS: true,
  prefix: '/trpc',
  trpcOptions: { router: appRouter, createContext },
});

server.setErrorHandler((error) => {
  server.log.error(error);
});

(async () => {
  if (process.env.NODE_ENV === 'development') {
    await server.register(cors, {
      origin: `https://${process.env.NX_FRONTEND_DOMAIN}`,
    });
  } else {
    await server.register(staticFiles, {
      root: resolve('./dist/apps/frontend'),
      wildcard: false,
    });

    server.get('*', (_request, reply) => {
      reply.sendFile('index.html');
    });
  }

  try {
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
