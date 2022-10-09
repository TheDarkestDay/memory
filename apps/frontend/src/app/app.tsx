import { RouterProvider, createBrowserRouter, redirect, json } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { GameFormValues } from '@memory/shared';

import { GamePage } from '../game/game-page';
import { trpc, trpcClient } from '../trpc';
import { WizardPage } from '../wizard/wizard-page';

const router = createBrowserRouter([
  { 
    path: '/', 
    element: <WizardPage />, 
    action: async ({ request }) => {
      const formData = await request.formData();
      const payload: GameFormValues = {
        fieldSize: Number(formData.get('fieldSize')),
        playersCount: Number(formData.get('playersCount')),
        theme: formData.get('theme') as GameFormValues['theme'],
      };

      const gameId = await trpcClient.mutation('createGame', payload);

      return redirect(`/game/${gameId}`);
    } 
  },
  { path: '/game/:gameId', 
    loader: async ({ params }) => {
      const { gameId } = params;

      if (gameId == null) {
        throw new Error('Failed to proceed to /game/:gameId path - gameId is missing');
      }

      const player = await trpcClient.mutation('joinGame', { gameId });

      return json(
        player,
        {
          status: 200
        }
      );
    },
    element: <GamePage /> 
  },
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
