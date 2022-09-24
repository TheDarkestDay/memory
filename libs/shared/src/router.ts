import { router, Subscription } from '@trpc/server';
import * as zod from 'zod';
import { EventEmitter } from 'events';

const players: string[] = [];

const rootEmitter = new EventEmitter();

export const createRouterWithContext = <TContext>() => {
  return router<TContext>()
    .subscription('joinedPlayersChange', {
      input: zod.object({
        playerName: zod.string(),
      }),
      resolve({input}) {
        const { playerName } = input;

        return new Subscription<string[]>((emit) => {
          const handleConnectedPlayersChange = () => {
            emit.data(players);
          };

          handleConnectedPlayersChange();

          rootEmitter.on('connectedPlayersChange', handleConnectedPlayersChange);

          return () => {
            rootEmitter.off('connectedPlayersChange', handleConnectedPlayersChange);
            
            const playerToRemoveIndex = players.indexOf(playerName);

            if (playerToRemoveIndex !== -1) {
              players.splice(playerToRemoveIndex, 1);

              rootEmitter.emit('connectedPlayersChange');
            }
          };
        })
      }
    })
    .mutation('joinGame', {
      input: zod.object({
        playerName: zod.string(),
      }),
      resolve({input}) {
        const { playerName } = input;

        players.push(playerName);

        rootEmitter.emit('connectedPlayersChange');
      }
    })
};

export type AppRouter = ReturnType<typeof createRouterWithContext>;