import { css } from '@emotion/react';
import { GameUiState } from '@memory/shared';
import { useState } from 'react';

import { GameCell } from './game-cell';

type Props = {
  state: GameUiState;
}

const styles = {
  grid: css({
    display: 'grid',
    margin: '0 auto',
    gap: '1.25rem',
    width: '100%',
    '@media (min-width: 768px)': {
      width: '35.75rem'
    }
  })
};

export const GameField = ({state}: Props) => {
  const [focusedCell, setFocusedCell] = useState([0, 0]);
  const { field, cellsRevealedThisTurn } = state;

  const [focusedRow, focusedCol] = focusedCell;

  const cells = [];

  const handleCellYNavigated = (row: number, col: number) => {
    setFocusedCell([row, col]);
  };

  for (let i = 0; i < field.length; i++) {
    for (let j = 0; j < field.length; j++) {
      const isCellRevealed = cellsRevealedThisTurn.some(([row, col]) => row === i && col === j);

      cells.push(
        <GameCell key={`${i}-${j}`} isFocused={focusedRow === i && focusedCol === j} isRevealed={isCellRevealed} row={i} col={j}  content={field[i][j]} onYNavigation={handleCellYNavigated} />
      );
    }
  }

  const gridStyles = css(styles.grid, {
    gridTemplateColumns: `repeat(${field.length}, 1fr)`,
    gridTemplateRows: `repeat(${field.length}, 2.875rem)`,
    '@media (min-width: 768px)': {
      gridTemplateRows: `repeat(${field.length}, 5.75rem)`
    }
  })

  return (
    <section css={gridStyles}>
      {cells}  
    </section>
  );
};