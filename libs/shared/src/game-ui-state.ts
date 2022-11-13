import { GameData, GamePhase } from './game-machine';

export type GameUiState = {
  phase: GamePhase;
  field: string[][];
  cellsRevealedThisTurn: [number, number][];
  currentPlayer: string;
  scores: Record<string, number>;
  players: string[];
  movesCount: number;
};

export const getGameUiStateFromGameData = (context: GameData): GameUiState => {
  const { field, phase, revealedCells, capturedCells, currentPlayer, scores, players, movesCount } = context;

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
    phase,
    field: fieldToRender,
    cellsRevealedThisTurn: revealedCells,
    currentPlayer,
    scores,
    players,
    movesCount
  }
};