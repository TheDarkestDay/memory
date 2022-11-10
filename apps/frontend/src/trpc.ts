import { createReactQueryHooks } from '@trpc/react';
import { httpLink } from '@trpc/client/links/httpLink';
import { createWSClient, wsLink } from '@trpc/client/links/wsLink';
import { splitLink } from '@trpc/client/links/splitLink';
import { AppRouter } from '@memory/shared';

export const trpc = createReactQueryHooks<AppRouter>();

const trpcRootUrl =
  process.env.NODE_ENV === 'production'
    ? `https://${process.env.NX_APP_DOMAIN}/trpc`
    : '/trpc';

export const trpcPublicClient = trpc.createClient({
  links: [
    httpLink({
      url: trpcRootUrl,
    })
  ]
});

export const createTrpcPrivateClient = () => {
  const wsClient = createWSClient({
    url: `wss://${process.env.NX_APP_DOMAIN}/trpc`,
  });
  
  return trpc.createClient({
    links: [
      splitLink({
        condition(op) {
          return op.type === 'subscription';
        },
        left: wsLink({
          client: wsClient,
        }),
        right: httpLink({
          url: trpcRootUrl,
        }),
      }),
    ]
  });
}; 
