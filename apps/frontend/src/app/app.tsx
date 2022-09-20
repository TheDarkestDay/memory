import { Game } from './game';
import { QueryClient, QueryClientProvider } from 'react-query';
import { httpLink } from '@trpc/client/links/httpLink';
import { createWSClient, wsLink } from '@trpc/client/links/wsLink';
import { splitLink } from '@trpc/client/links/splitLink';

import { trpc } from './trpc';

const wsClient = createWSClient({
  url: 'ws://localhost:3001',
});

const client = trpc.createClient({
  links: [
    splitLink({
      condition(op) {
        return op.type === 'subscription';
      },
      // left: wsLink({
      //   client: wsClient,
      // }),
      left: httpLink({
        url: 'http://localhost:3001/trpc',
      }),
      right: httpLink({
        url: 'http://localhost:3001/trpc',
      }),
    })
  ]
});

const queryClient = new QueryClient();

export const App = () => {
  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Game />
      </QueryClientProvider>
    </trpc.Provider>
  )
}