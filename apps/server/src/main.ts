import ws from '@fastify/websocket'
import fastify from 'fastify';
import cors from '@fastify/cors';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { createRouterWithContext } from '@memory/shared';

import { Context } from './context';

const PORT = 3001;

const server = fastify({
  maxParamLength: 5000,
});

server.get('/hello', (_, response) => {
  response.send('Regular route works!');
});

const appRouter = createRouterWithContext<Context>();

server.register(ws);

server.register(fastifyTRPCPlugin, {
  useWSS: true,
  prefix: '/trpc',
  trpcOptions: { router: appRouter },
});

(async () => {
  await server.register(cors);

  try {
    await server.listen({ port: PORT });
    console.log(`Server listening on port ${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();