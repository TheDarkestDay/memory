import { router, Subscription } from '@trpc/server';
import * as zod from 'zod';

import { GameContext } from './game-machine';
import { GameUiState, getGameUiStateFromContext } from './game-ui-state';
import { GameManager, Player } from './game-manager';
import { WebServerContext } from './web-server-context';

export const createRouterWithContext = <TContext extends WebServerContext>(gameManager: GameManager) => {
  return router<TContext>()
    .subscription('joinedPlayersChange', {
      input: zod.object({
        gameId: zod.string().optional(),
      }),
      resolve({input}) {
        const { gameId } = input;

        if (gameId == null) {
          throw new Error('Failed to subscribe to joinedPlayersChange because gameId is not provided');
        }

        return new Subscription<Player[]>((emit) => {
          const handleConnectedPlayersChange = (players: Player[]) => {
            emit.data(players);
          };

          handleConnectedPlayersChange(
            gameManager.getPlayersList(gameId)
          );

          gameManager.on(gameId, 'playersListChange', handleConnectedPlayersChange);

          return () => {
            gameManager.off(gameId, 'playersListChange', handleConnectedPlayersChange);
          };
        })
      }
    })
    .subscription('gameStateChange', {
      input: zod.object({
        gameId: zod.string().optional(),
      }),
      async resolve({input, ctx}) {
        const { gameId } = input;

        if (gameId == null) {
          throw new Error('Failed to subscribe to gameStateChange because gameId is not provided');
        }

        const { playerId } = ctx;

        if (playerId == null) {
          throw new Error('Failed to subscribe to gameStateChange because playerId is not provided');
        }

        const player = await gameManager.getPlayerById(gameId, playerId);
        
        return new Subscription<GameUiState | null>((emit) => {
          const handleGameStateChange = (context: GameContext) => {
            emit.data(
              getGameUiStateFromContext(context)
            );
          };

          if (!gameManager.isGameStarted(gameId)) {
            emit.data(null);
          } else {
            handleGameStateChange(gameManager.getGameContext(gameId));
          }

          gameManager.on(gameId, 'gameStateChange', handleGameStateChange);

          return () => {
            gameManager.off(gameId, 'gameStateChange', handleGameStateChange);

            gameManager.removePlayer(gameId, player.name);
          };
        });
      }
    })
    .mutation('joinGame', {
      input: zod.object({
        gameId: zod.string()
      }),
      resolve({input, ctx}) {
        const { gameId } = input;
        const { playerId } = ctx;

        if (playerId == null) {
          const newPlayer = gameManager.addPlayer(gameId);

          ctx.setCookie('playerId', newPlayer.id);

          return newPlayer;
        }

        return gameManager.getPlayerById(gameId, playerId);
      }
    })
    .mutation('createGame', {
      input: zod.object({
        theme: zod.enum(['numbers', 'emojis']),
        fieldSize: zod.number(),
        playersCount: zod.number(),
      }),
      async resolve({input}) {
        const { theme, fieldSize, playersCount } = input;

        const newGame = await gameManager.createNewGame({theme, fieldSize, playersCount});

        return newGame.id;
      }
    })
    .mutation('openCell', {
      input: zod.object({
        gameId: zod.string().optional(),
        row: zod.number(),
        col: zod.number(),
        playerName: zod.string(),
      }),
      resolve({input}) {
        const { gameId, row, col, playerName } = input;

        if (gameId == null) {
          throw new Error('Failed to reveal cell because gameId is not provided');
        }

        gameManager.revealCell(gameId, row, col, playerName);;
      }
    })
    .mutation('startGame', {
      input: zod.object({
        gameId: zod.string().optional(),
      }),
      resolve({input}) {
        const { gameId } = input;

        if (gameId == null) {
          throw new Error('Failed to start game because no gameId was provided');
        }

        gameManager.startGame(gameId);
      }
    })
};

export type AppRouter = ReturnType<typeof createRouterWithContext>;