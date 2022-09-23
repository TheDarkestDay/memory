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
          const handlePlayerJoined = (joinedPlayerName: string) => {
            players.push(joinedPlayerName);

            emit.data(players);
          };

        //  handlePlayerJoined(playerName);

          const handlePlayerLeft = (playerToRemove: string) => {
            const playerToRemoveIndex = players.indexOf(playerToRemove);

            if (playerToRemoveIndex !== -1) {
              players.splice(playerToRemoveIndex, 1);

              emit.data(players);
            }
          };

          rootEmitter.on('playerJoined', handlePlayerJoined);
          rootEmitter.on('playerLeft', handlePlayerLeft);

          return () => {
            rootEmitter.off('playerJoined', handlePlayerJoined);
            rootEmitter.off('playerLeft', handlePlayerLeft); 
            
            rootEmitter.emit('playerLeft', playerName);
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

        rootEmitter.emit('playerJoined', playerName);
      }
    })
};

export type AppRouter = ReturnType<typeof createRouterWithContext>;