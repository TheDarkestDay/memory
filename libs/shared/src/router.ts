import { router, Subscription } from '@trpc/server';
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
      resolve() {
        const currentPlayersCount = players.length;
        const newPlayerName = `Player ${currentPlayersCount + 1}`;

        rootEmitter.emit('playerJoined', newPlayerName);
      }
    });
};

export type AppRouter = ReturnType<typeof createRouterWithContext>;