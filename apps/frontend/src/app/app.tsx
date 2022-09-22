import { Game } from './game';
import { QueryClient, QueryClientProvider } from 'react-query';
import { httpLink } from '@trpc/client/links/httpLink';
import { createWSClient, wsLink } from '@trpc/client/links/wsLink';
import { splitLink } from '@trpc/client/links/splitLink';

import { trpc } from './trpc';
import { useState } from 'react';

export const App = () => {
  const [wsClient] = useState(() => createWSClient({
    url: 'ws://localhost:3001/trpc',
  }));

  const [trpcClient]  = useState(() => {
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
            url: 'http://localhost:3001/trpc',
          }),
        })
      ]
    });
  });
  
  const [queryClient] = useState(() => new QueryClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Game />
      </QueryClientProvider>
    </trpc.Provider>
  )
}