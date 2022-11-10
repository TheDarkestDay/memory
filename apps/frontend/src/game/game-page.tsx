import { QueryClient, QueryClientProvider } from 'react-query';

import { Game } from './game';
import { createTrpcPrivateClient, trpc } from '../trpc';  

export const GamePage = () => {
  const queryClient = new QueryClient();
  const trpcPrivateClient = createTrpcPrivateClient();

  return (
    <trpc.Provider client={trpcPrivateClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Game />
      </QueryClientProvider>
    </trpc.Provider>
  );
};