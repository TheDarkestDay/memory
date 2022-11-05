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
    borderRadius: '100%',
    border: 'none',
    backgroundColor: '#bcced9',
    '@media (min-width: 768px)': {
      fontSize: '2.75rem',
    }
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

  const rootStyles = css(
    styles.root,
    content === '❓' && {
      backgroundColor: '#304859',
      ':hover': {
        backgroundColor: '#6395b8',
      }
    },
    isRevealed && {
      backgroundColor: '#fda214',
    }
  );

  return (
    <button css={rootStyles} onClick={handleCellButtonClick}>
      {content === '❓' ? '' : content}
    </button>
  );
};