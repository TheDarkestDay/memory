import { router, Subscription } from '@trpc/server';
import * as zod from 'zod';
import { EventEmitter } from 'events';

import { shuffleArray } from './utils';

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
let gameField: string[][] = [];

type CellOpenedPayload = {
  row: number;
  col: number;
  content: string;
};

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
    .subscription('gameStart', {
      resolve() {
        return new Subscription<number>((emit) => {
          const handleFieldReady = (fieldSize: number) => {
            emit.data(fieldSize);
          };

          handleFieldReady(gameField.length);

          rootEmitter.on('fieldReady', handleFieldReady);

          return () => {
            rootEmitter.off('fieldReady', handleFieldReady);
          };
        });
      }
    })
    .subscription('cellOpened', {
      input: zod.object({
        row: zod.number(),
        col: zod.number(),
      }),
      resolve({input}) {
        const { row, col } = input;

        return new Subscription<string>((emit) => {
          const handleCellOpened = ({row: openedRow, col: openedCol, content}: CellOpenedPayload) => {
            if (openedRow === row && openedCol === col) {
              emit.data(content);
            }
          };

          rootEmitter.on('cellOpened', handleCellOpened);

          return () => {
            rootEmitter.off('cellOpened', handleCellOpened);
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
      }),
      resolve({input}) {
        const { row, col } = input;

        const cellContent = gameField[row][col];

        if (cellContent == null) {
          throw new Error(`Cell in at ${row}:${col} does not exist.`);
        }

        rootEmitter.emit('cellOpened', {row, col, content: cellContent});
      }
    })
    .mutation('startGame', {
      input: zod.object({
        fieldSize: zod.number().default(DEFAULT_FIELD_SIZE),
      }),
      resolve({input}) {
        const fieldSize = input.fieldSize;

        gameField = [];
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

        rootEmitter.emit('fieldReady', gameField.length);
      }
    })
};

export type AppRouter = ReturnType<typeof createRouterWithContext>;