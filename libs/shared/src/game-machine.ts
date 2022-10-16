import { createMachine, assign } from 'xstate';

type GameStateConfig = {
  field: string[][];
  players: string[];
};

export type GameContext = GameStateConfig & {
  winner: string | null;
  scores: Record<string, number>;
  currentPlayer: string;
  revealedCells: [number, number][];
  capturedCells: [number, number][];
};

type TakeOneEvent = {
  row: number;
  col: number;
  playerName: string;
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
    initial: 'playing',
    predictableActionArguments: true,
    schema: {
      context: {} as GameContext,
    },
    context: {
      winner: null,
      field,
      players,
      currentPlayer: players[0],
      scores,
      revealedCells: [],
      capturedCells: [],
    },
    states: {
      playing: {
        invoke: {
          id: 'checkScore',
          src: () => {
            return (callback) => {
              const timeoutHandle = setTimeout(() => {
                callback('CHECK_SCORE');
              }, 1_500);

              return () => clearTimeout(timeoutHandle);
            };
          }
        },
        on: {
          REVEAL_NEXT_CELL: [
            {
              cond: (context, event) => {
                const { playerName, row, col } = event as unknown as TakeOneEvent;
                const { currentPlayer, revealedCells } = context;

                const allVisibleCells = [...revealedCells, ...context.capturedCells];
                const isRequestedCellVisible = allVisibleCells.some(([cellRow, cellCol]) => cellRow === row && cellCol === col);
                
                return !isRequestedCellVisible && currentPlayer === playerName && revealedCells.length < 2;
              },
              target: 'playing',
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
          CHECK_SCORE: [
            {
              target: 'playing',
              cond: (context) => context.revealedCells.length === 2,
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

export type GameMachine = ReturnType<typeof createGameMachine>;