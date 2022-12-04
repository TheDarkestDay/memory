import { router, Subscription } from '@trpc/server';
import * as zod from 'zod';

import { GameData } from './game-machine';
import { GameUiState, getGameUiStateFromGameData } from './game-ui-state';
import { GameManager, Player } from './game-manager';
import { WebServerContext } from './web-server-context';

export const createRouterWithContext = <TContext extends WebServerContext>(gameManager: GameManager) => {
  const getOrCreatePlayer = (playerId: string | undefined, gameId: string, ctx: TContext) => {
    if (playerId == null || !gameManager.isPlayerJoinedGame(gameId, playerId)) {
      const newPlayer = gameManager.addPlayer(gameId);

      ctx.setCookie('playerId', newPlayer.id);

      return newPlayer;
    }

    return gameManager.getPlayerById(gameId, playerId);
  }

  return router<TContext>()
    .subscription('joinedPlayersChange', {
      input: zod.object({
        gameId: zod.string(),
      }),
      resolve({input}) {
        const { gameId } = input;

        return new Subscription<Player[]>((emit) => {
          const handleConnectedPlayersChange = (players: Player[]) => {
            emit.data(players);
          };

          handleConnectedPlayersChange(
            gameManager.getConnectedPlayersList(gameId)
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
        gameId: zod.string(),
      }),
      async resolve({input, ctx}) {
        const { gameId } = input;

        let player: Player | null;

        const { playerId } = ctx;

        if (playerId != null) {
          player = await gameManager.getPlayerById(gameId, playerId);
          gameManager.connectPlayer(gameId, playerId);
        }
        
        return new Subscription<GameUiState | null>((emit) => {
          const handleGameStateChange = (data: GameData) => {
            emit.data(
              getGameUiStateFromGameData(data)
            );
          };

          if (!gameManager.isGameStarted(gameId)) {
            emit.data(null);
          } else {
            handleGameStateChange(gameManager.getGameData(gameId));
          }

          gameManager.on(gameId, 'gameStateChange', handleGameStateChange);

          return () => {
            gameManager.off(gameId, 'gameStateChange', handleGameStateChange);

            if (player != null) {
              gameManager.disconnectPlayer(gameId, player.id);
            }
          };
        });
      }
    })
    .mutation('joinGame', {
      input: zod.object({
        gameId: zod.string()
      }),
      async resolve({input, ctx}) {
        const { gameId } = input;
        const { playerId } = ctx;

        const player = await getOrCreatePlayer(playerId, gameId, ctx);
        const gameConfig = gameManager.getGameConfig(gameId);

        return {
          ...gameConfig,
          player,
        };
      }
    })
    .mutation('createGame', {
      input: zod.object({
        theme: zod.enum(['numbers', 'emojis']),
        fieldSize: zod.number(),
        playersCount: zod.number(),
        speed: zod.enum(['normal', 'relaxing'])
      }),
      async resolve({input}) {
        const { theme, fieldSize, playersCount, speed } = input;

        const newGame = await gameManager.createNewGame({theme, fieldSize, playersCount, speed});

        return newGame.id;
      }
    })
    .mutation('openCell', {
      input: zod.object({
        gameId: zod.string(),
        row: zod.number(),
        col: zod.number(),
        playerName: zod.string(),
      }),
      async resolve({input, ctx}) {
        const { gameId } = input;
        const { playerId } = ctx;

        if (playerId == null) {
          throw new Error(`Failed to open a cell: player id is not set`);
        }

        if (!gameManager.isPlayerJoinedGame(gameId, playerId)) {
          throw new Error(`Failed to open a cell: player with this id is not in the game`);
        }

        const { row, col, playerName } = input;

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
    .mutation('restartGame', {
      input: zod.object({
        gameId: zod.string().optional(),
      }),
      resolve({input}) {
        const { gameId } = input;

        if (gameId == null) {
          throw new Error('Failed to re-start game because no gameId was provided');
        }

        gameManager.restartGame(gameId);
      }
    })
};

export type AppRouter = ReturnType<typeof createRouterWithContext>;