import { createMachine, assign } from 'xstate';

type GameStateConfig = {
  field: string[][];
  players: string[];
};

type GameContext = GameStateConfig & {
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
    on: {
      REVEAL_NEXT_CELL: [
        {
          target: 'cellsRevealed',
          cond: (context) => {
            return context.revealedCells.length === 1;
          },
          actions: [
            assign<GameContext>((context, event) => {
              const { row, col } = event as unknown as TakeOneEvent;

              return {
                ...context,
                revealedCells: [...context.revealedCells, [row, col]],
              };
            })
          ]
        },
        {
          target: 'countingScore',
          cond: (context) => {
            return context.revealedCells.length === 2;
          },
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
      ],
    },
    states: {
      cellsRevealed: {},
      countingScore: {
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
    actions: {}
  });
};