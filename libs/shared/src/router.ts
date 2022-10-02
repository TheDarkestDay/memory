import { router, Subscription } from '@trpc/server';
import * as zod from 'zod';
import { EventEmitter } from 'events';
import { interpret, InterpreterFrom } from 'xstate';

import { createGameMachine, GameContext } from './game-machine';
import { shuffleArray } from './utils';
import { GameUiState, getGameUiStateFromContext } from './game-ui-state';

const characters = [
  '❤️', 
  '😊', 
  '✨', 
  '🔥', 
  '😂', 
  '👍', 
  '✅', 
  '✔️', 
  '😭', 
  '🥰', 
  '😍', 
  '🥺',
  '🤍',
  '👀',
  '🎉',
  '🥲',
  '😉',
  '👉',
  '⭐',
  '❤️‍🔥',
  '🤔',
  '🤩',
  '🤣',
  '🤗'
];
const DEFAULT_FIELD_SIZE = 4;

const players: string[] = [];

const rootEmitter = new EventEmitter();

let gameService: InterpreterFrom<ReturnType<typeof createGameMachine>> | null = null;

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
    .subscription('gameStateChange', {
      resolve() {
        return new Subscription<GameUiState | null>((emit) => {
          const handleGameStateChange = (context: GameContext) => {
            emit.data(
              getGameUiStateFromContext(context)
            );
          };

          if (gameService == null) {
            emit.data(null);
          } else {
            const gameSnapshot = gameService.getSnapshot();
            handleGameStateChange(gameSnapshot.context);
          }

          rootEmitter.on('gameStateChange', handleGameStateChange);

          return () => {
            rootEmitter.off('gameStateChange', handleGameStateChange);
          };
        });
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
    .mutation('openCell', {
      input: zod.object({
        row: zod.number(),
        col: zod.number(),
        playerName: zod.string(),
      }),
      resolve({input}) {
        const { row, col, playerName } = input;

        if (gameService == null) {
          throw new Error('Tried to reveal a cell when the game has not yet started');
        }

        gameService.send({type: 'REVEAL_NEXT_CELL', row, col, playerName});
      }
    })
    .mutation('startGame', {
      input: zod.object({
        fieldSize: zod.number().default(DEFAULT_FIELD_SIZE),
      }),
      resolve({input}) {
        const fieldSize = input.fieldSize;

        const gameField = [] as string[][];
        for (let j = 0; j < fieldSize; j++) {
          gameField.push([]);
        }

        const gameFieldPositions = [];
        for (let i = 0; i < fieldSize; i++) {
          for (let j = 0; j < fieldSize; j++) {
            gameFieldPositions.push([i, j]);
          }
        }

        const randomPositions = shuffleArray(gameFieldPositions);

        const requiredCharacters = fieldSize * fieldSize / 2;

        for (let i = 0; i < requiredCharacters; i++) {
          const character = characters[i];

          const firstPosition = randomPositions.pop();
          const secondPosition = randomPositions.pop();

          if (!firstPosition || !secondPosition) {
            throw new Error('Field is not big enough for number of characters requested');
          }

          const [x1, y1] = firstPosition;
          const [x2, y2] = secondPosition;

          gameField[x1][y1] = character;
          gameField[x2][y2] = character;
        }

        const gameMachine = createGameMachine({
          players,
          field: gameField,
        });

        gameService = interpret(gameMachine).onChange((context) => {
          rootEmitter.emit('gameStateChange', context);
        });

        gameService.start();
      }
    })
};

export type AppRouter = ReturnType<typeof createRouterWithContext>;