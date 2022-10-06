import { RouterProvider, createBrowserRouter, redirect } from 'react-router-dom';
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
