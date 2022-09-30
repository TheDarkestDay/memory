import { createMachine, assign } from 'xstate';

type GameStateConfig = {
  field: string[][];
  players: string[];
};

export type GameContext = GameStateConfig & {
  scores: Record<string, number>;
  currentPlayer: string;
  revealedCells: [number, number][];
  capturedCells: [number, number][];
};

type TakeOneEvent = {
  row: number;
  col: number;
};

export const createGameMachine = ({field, players}: GameStateConfig) => {
  const scores = players.reduce((acc, playerName) => {
    return {
      ...acc,
      [playerName]: 0,
    };
  }, {});

  return createMachine({
    id: 'game',
    initial: 'pending',
    predictableActionArguments: true,
    schema: {
      context: {} as GameContext,
    },
    context: {
      field,
      players,
      currentPlayer: players[0],
      scores,
      revealedCells: [],
      capturedCells: [],
    },
    states: {
      pending: {
        on: {
          REVEAL_NEXT_CELL: [
            {
              target: 'cellRevealed',
              actions: [
                assign<GameContext>((context, event) => {
                  const { row, col } = event as unknown as TakeOneEvent;
    
                  return {
                    ...context,
                    revealedCells: [...context.revealedCells, [row, col]],
                  };
                })
              ]
            }
          ],
        },
      },
      cellRevealed: {
        on: {
          REVEAL_NEXT_CELL: [
            {
              target: 'countingScore',
              actions: [
                assign<GameContext>((context, event) => {
                  const { row, col } = event as unknown as TakeOneEvent;
    
                  return {
                    ...context,
                    revealedCells: [...context.revealedCells, [row, col]],
                  };
                })
              ]
            }
          ]
        }
      },
      countingScore: {
        invoke: {
          id: 'passTurnToNextPlayer',
          src: () => {
            return (callback) => {
              setTimeout(() => {
                callback('PASS_TURN_TO_NEXT_PLAYER');
              }, 3_000);
            };
          }
        },
        on: {
          PASS_TURN_TO_NEXT_PLAYER: [
            {
              target: 'pending',
              actions: assign<GameContext>((context) => {
                const { players, field, scores, currentPlayer, capturedCells } = context;
                const [[firstRevealedRow, firstRevealedCol], [secondRevealedRow, secondRevealedCol]] = context.revealedCells;

                const currentPlayerIndex = players.findIndex((playerName) => playerName === currentPlayer);
                const nextPlayer = players[currentPlayerIndex + 1] || players[0];

                const firstCell = field[firstRevealedRow][firstRevealedCol];
                const secondCell = field[secondRevealedRow][secondRevealedCol];

                const isScored = firstCell === secondCell;

                return {
                  ...context,
                  capturedCells: capturedCells.concat(
                    isScored 
                      ? [[firstRevealedRow, firstRevealedCol], [secondRevealedRow, secondRevealedCol]] 
                      : []
                  ),
                  scores: {
                    ...scores,
                    [currentPlayer]: isScored 
                      ? scores[currentPlayer] + 1 
                      : scores[currentPlayer],
                  },
                  revealedCells: [],
                  currentPlayer: nextPlayer,
                };
              })
            }
          ]
        }
      },
    },
  }, {
    actions: {},
  });
};