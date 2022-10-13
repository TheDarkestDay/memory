import { createReactQueryHooks } from '@trpc/react';
import { httpLink } from '@trpc/client/links/httpLink';
import { createWSClient, wsLink } from '@trpc/client/links/wsLink';
import { splitLink } from '@trpc/client/links/splitLink';
import { AppRouter } from '@memory/shared';

export const trpc = createReactQueryHooks<AppRouter>();

const wsClient = createWSClient({
  url: 'wss://local-server.thedarkestday-memory.com:3001/trpc',
});

export const trpcClient = trpc.createClient({
  links: [
    splitLink({
      condition(op) {
        return op.type === 'subscription';
      },
      left: wsLink({
        client: wsClient,
      }),
      right: httpLink({
        url: '/trpc',
      }),
    })
  ]
});
