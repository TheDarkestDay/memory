import ws from '@fastify/websocket'
import fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { createRouterWithContext } from '@memory/shared';

import { Context, createContext } from './context';
import { inMemoryGameManager } from './game/in-memory-game-manager';

const PORT = 3001;

const server = fastify({
  maxParamLength: 5000,
});

server.register(cookie);

const appRouter = createRouterWithContext<Context>(
  inMemoryGameManager
);

server.register(ws);

server.register(fastifyTRPCPlugin, {
  useWSS: true,
  prefix: '/trpc',
  trpcOptions: { router: appRouter, createContext },
});

(async () => {
  await server.register(cors, {
    origin: 'https://local.thedarkestday-memory.com:4200'
  });

  try {
    await server.listen({ port: PORT });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();