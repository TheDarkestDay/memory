import { createMachine, assign, send, InterpreterFrom } from 'xstate';

type GameStateConfig = {
  field: string[][];
  players: string[];
};

export type GamePhase = 'playing' | 'finished';

export type GameContext = GameStateConfig & {
  scores: Record<string, number>;
  currentPlayer: string;
  revealedCells: [number, number][];
  capturedCells: [number, number][];
};

export type GameData = {
  phase: GamePhase;
} & GameContext;

export type RevealNextCellEvent = {
  row: number;
  col: number;
  playerName: string;
};

type RestartEvent = {
  field: string[][];
};

type GameMachineOptions = {
  checkScoreDelay?: number;
};

const REVEAL_CELL_ACTION = assign<GameContext>((context, event) => {
  const { row, col } = event as unknown as RevealNextCellEvent;

  return {
    ...context,
    revealedCells: [...context.revealedCells, [row, col]],
  };
});

export const createGameMachine = ({field, players}: GameStateConfig, { checkScoreDelay }: GameMachineOptions = { checkScoreDelay: 1_500 }) => {
  const scores = players.reduce((acc, playerName) => {
    return {
      ...acc,
      [playerName]: 0,
    };
  }, {});

  return createMachine({
    id: 'game',
    initial: 'noCellsRevealed',
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
      noCellsRevealed: {
        on: {
          REVEAL_NEXT_CELL: [
            {
              cond: 'isTurnValid',
              target: 'firstCellRevealed',
              actions: [
                REVEAL_CELL_ACTION             
              ]
            }
          ]
        }
      },
      firstCellRevealed: {
        on: {
          REVEAL_NEXT_CELL: [
            {
              cond: 'isTurnValid',
              target: 'secondCellRevealed',
              actions: [
                REVEAL_CELL_ACTION             
              ]
            }
          ]
        }
      },
      secondCellRevealed: {
        invoke: {
          id: 'checkScore',
          src: () => {
            return (callback) => {
              const timeoutHandle = setTimeout(() => {
                callback('CHECK_SCORE');
              }, checkScoreDelay);

              return () => clearTimeout(timeoutHandle);
            };
          }
        },
        on: {
          CHECK_SCORE: [
            {
              target: 'lookingForWinner',
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
      lookingForWinner: {
        entry: send('CHECK_WINNER'),
        on: {
          CHECK_WINNER: [
            {
              target: 'noCellsRevealed',
              cond: (context) => context.capturedCells.length < (field.length * field[0].length),
            },
            {
              target: 'finished',
              cond: (context) => context.capturedCells.length === (field.length * field[0].length),
            },
          ]
        }
      },
      finished: {
        on: {
          RESTART: [
            {
              target: 'noCellsRevealed',
              actions: assign<GameContext>((_context, event) => {
                const { field } = event as unknown as RestartEvent;

                return {
                  field,
                  players,
                  currentPlayer: players[0],
                  scores,
                  revealedCells: [],
                  capturedCells: [],
                };
              })
            }
          ]
        }
      }
    },
  }, {
    actions: {},
    guards: {
      isTurnValid: (context, event) => {
        const { playerName, row, col } = event as unknown as RevealNextCellEvent;
        const { currentPlayer, revealedCells } = context;

        const allVisibleCells = [...revealedCells, ...context.capturedCells];
        const isRequestedCellVisible = allVisibleCells.some(([cellRow, cellCol]) => cellRow === row && cellCol === col);
        
        return !isRequestedCellVisible && currentPlayer === playerName && revealedCells.length < 2;
      }
    }
  });
};

export type GameMachine = ReturnType<typeof createGameMachine>;

export type GameService = InterpreterFrom<GameMachine>;