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
                  const [[firstRevealedRow, firstRevealedCol]] = context.revealedCells;
    
                  const { field, scores, currentPlayer, capturedCells } = context;
    
                  const firstCell = field[firstRevealedRow][firstRevealedCol];
                  const secondCell = field[row][col];
    
                  if (firstCell === secondCell) {
                    return {
                      ...context,
                      capturedCells: capturedCells.concat([firstRevealedRow, firstRevealedCol], [row, col]),
                      scores: {
                        ...scores,
                        [currentPlayer]: scores[currentPlayer] + 1,
                      }
                    };
                  }
    
                  return context;
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
                const { players, currentPlayer } = context;
                const currentPlayerIndex = players.findIndex((playerName) => playerName === currentPlayer);

                const nextPlayer = players[currentPlayerIndex + 1] || players[0];

                return {
                  ...context,
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