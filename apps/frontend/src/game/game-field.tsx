import { css } from '@emotion/react';
import { GameUiState } from '@memory/shared';

import { GameCell } from './game-cell';

type Props = {
  state: GameUiState;
}

const styles = {
  grid: css({
    display: 'grid',
    gap: '1.25rem',
    justifyContent: 'center',
  })
};

export const GameField = ({state}: Props) => {
  const { field, cellsRevealedThisTurn } = state;

  const cells = [];

  for (let i = 0; i < field.length; i++) {
    for (let j = 0; j < field.length; j++) {
      const isCellRevealed = cellsRevealedThisTurn.some(([row, col]) => row === i && col === j);

      cells.push(
        <GameCell key={`${i}-${j}`} isRevealed={isCellRevealed} row={i} col={j}  content={field[i][j]} />
      );
    }
  }

  const gridStyles = css(styles.grid, {
    gridTemplateColumns: `repeat(${field.length}, 6rem)`,
    gridTemplateRows: `repeat(${field.length}, 6rem)`,
  })

  return (
    <section css={gridStyles}>
      {cells}  
    </section>
  );
};