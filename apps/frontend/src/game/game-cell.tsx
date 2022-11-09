import { Player } from '@memory/shared';
import { useLoaderData, useParams } from 'react-router-dom';
import { css } from '@emotion/react';

import { trpc } from '../trpc';

type Props = {
  row: number;
  col: number;
  content: string;
  isRevealed: boolean;
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

export const GameCell = ({row, col, content, isRevealed}: Props) => {
  const { gameId } = useParams();
  const { name: playerName } = useLoaderData() as Player;
  const revealCell = trpc.useMutation('openCell');

  if (gameId == null) {
    throw new Error('Failed to proceed to /game/:gameId path - gameId is missing');
  }

  const handleCellButtonClick = () => {
    revealCell.mutateAsync({gameId, row, col, playerName});
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

  return (
    <button css={styles.root} onClick={handleCellButtonClick}>
      <div css={flippableStyles}>
        <div css={styles.front}></div>
        <div css={backStyles}>
          {content !== '❓' && content}
        </div>
      </div>
    </button>
  );
};