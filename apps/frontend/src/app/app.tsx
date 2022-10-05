import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';

import { GamePage } from '../game/game-page';
import { trpc, trpcClient } from '../trpc';
import { WizardPage } from '../wizard/wizard-page';
import { GameConfig } from '@memory/shared';

const router = createBrowserRouter([
  { 
    path: '/', 
    element: <WizardPage />, 
    action: async ({ request }) => {
      const formData = await request.formData();
      const payload: GameConfig = {
        fieldSize: Number(formData.get('fieldSize')),
        numberOfPlayers: Number(formData.get('numberOfPlayers')),
        theme: formData.get('theme') as GameConfig['theme'],
      };

      const gameId = await trpcClient.mutation('createGame', payload);

      return redirect(`/game/${gameId}`);
    } 
  },
  { path: '/game/:gameId', element: <GamePage /> },
]);

const queryClient = new QueryClient();

export const App = () => {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </trpc.Provider>
  );
};
