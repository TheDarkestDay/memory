import { router, Subscription } from '@trpc/server';
import * as zod from 'zod';
import { EventEmitter } from 'events';

const players: string[] = [];

const rootEmitter = new EventEmitter();

export const createRouterWithContext = <TContext>() => {
  return router<TContext>()
    .subscription('onPlayerJoined', {
      resolve() {
        return new Subscription<string[]>((emit) => {
          const handlePlayerJoined = (playerName: string) => {
            players.push(playerName);

            emit.data(players);
          };

          rootEmitter.on('playerJoined', handlePlayerJoined);

          return () => {
            rootEmitter.off('playerJoined', handlePlayerJoined);
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
    });
};

export type AppRouter = ReturnType<typeof createRouterWithContext>;