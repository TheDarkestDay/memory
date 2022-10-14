import { GameContext } from './game-machine';

export type GameUiState = {
  field: string[][];
  cellsRevealedThisTurn: [number, number][];
  currentPlayer: string;
  scores: Record<string, number>;
  players: string[];
};

export const getGameUiStateFromContext = (context: GameContext): GameUiState => {
  const { field, revealedCells, capturedCells, currentPlayer, scores, players } = context;

  const fieldToRender = [];

  const cellsToReveal = revealedCells.concat(capturedCells);

  for (let i = 0; i < field.length; i++) {
    fieldToRender.push([] as string[]);
    for (let j = 0; j < field.length; j++) {
      const isRevealed = cellsToReveal.some(([row, col]) => row === i && col === j);
      const cellContent = isRevealed ? field[i][j] : '❓';

      fieldToRender[i].push(cellContent);
    }
  }

  return {
    field: fieldToRender,
    cellsRevealedThisTurn: revealedCells,
    currentPlayer,
    scores,
    players
  }
};