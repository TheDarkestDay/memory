import { GameInfoForPlayer } from '@memory/shared';
import { useLoaderData, useParams } from 'react-router-dom';
import { css } from '@emotion/react';

import { trpc } from '../trpc';
import { useEffect, useRef } from 'react';

type Props = {
  row: number;
  col: number;
  content: string;
  isRevealed: boolean;
  isFocused?: boolean;
  onYNavigation: (row: number, col: number) => void;
};

const styles = {
  root: css({
    fontSize: '1rem',
    fontWeight: 'bold',
    borderRadius: '100%',
    border: 'none',
    perspective: '500px',
    background: 'none',
    color: '#fcfcfc',
    '@media (min-width: 768px)': {
      fontSize: '2.75rem',
    }
  }),
  flippable: css({
    width: '100%',
    height: '100%',
    transition: 'transform .5s',
    transformStyle: 'preserve-3d',
  }),
  front: css({
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '100%',
    backgroundColor: '#304859',
    ':hover': {
      backgroundColor: '#6395b8',
    },
    backfaceVisibility: 'hidden',
  }),
  back: css({
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    borderRadius: '100%',
    backfaceVisibility: 'hidden',
    transform: 'rotateY(180deg)',
  })
};

const getNextCellCoordinates = (key: string) => {
  switch (key) {
    case 'ArrowUp':
      return [-1, 0];
    case 'ArrowDown':
      return [1, 0];
    case 'ArrowRight': 
      return [0, 1];
    case 'ArrowLeft':
      return [0, -1];
    default:
      return [0, 0];
  }
};

export const GameCell = ({row, col, content, isFocused = false, isRevealed, onYNavigation}: Props) => {
  const { gameId } = useParams();
  const { player: { name } } = useLoaderData() as GameInfoForPlayer;
  const { mutateAsync: revealCell} = trpc.useMutation('openCell');

  const buttonRef = useRef<HTMLButtonElement | null>(null);

  if (gameId == null) {
    throw new Error('Failed to proceed to /game/:gameId path - gameId is missing');
  }

  useEffect(() => {
    if (isFocused) {
      buttonRef.current?.focus();
    }
  }, [isFocused]);

  useEffect(() => {
    const buttonElement = buttonRef.current;
    if (buttonElement == null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;

      const [dRow, dCol] = getNextCellCoordinates(key);

      onYNavigation(row + dRow, col + dCol);
    };

    buttonElement.addEventListener('keydown', handleKeyDown);

    return () => buttonElement.removeEventListener('keydown', handleKeyDown);
  }, [row, col]);

  const handleCellButtonClick = () => {
    revealCell({gameId, row, col, playerName: name});
  }

  const shouldFlipCellOver = isRevealed || (content !== '❓');

  const flippableStyles = css(
    styles.flippable,
    shouldFlipCellOver && {
      transform: 'rotateY(180deg)'
    }
  );

  const backStyles = css(
    styles.back,
    {
      backgroundColor: isRevealed ? '#fda214' : '#bcced9'
    }
  );

  const ariaLabel = `Cell at row ${row + 1} and column ${col + 1}`;

  return (
    <button ref={buttonRef} css={styles.root} onClick={handleCellButtonClick} aria-label={ariaLabel}>
      <div css={flippableStyles}>
        <div css={styles.front}></div>
        <div css={backStyles}>
          {content !== '❓' && content}
        </div>
      </div>
    </button>
  );
};