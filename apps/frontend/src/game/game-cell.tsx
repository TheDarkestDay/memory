import { Player } from '@memory/shared';
import { useLoaderData, useParams } from 'react-router-dom';
import { trpc } from '../trpc';

type Props = {
  row: number;
  col: number;
  content: string;
};

export const GameCell = ({row, col, content}: Props) => {
  const { gameId } = useParams();
  const { name: playerName } = useLoaderData() as Player;
  const revealCell = trpc.useMutation('openCell');

  const handleCellButtonClick = () => {
    revealCell.mutateAsync({gameId, row, col, playerName});
  }

  return (
    <button onClick={handleCellButtonClick}>
      {content}
    </button>
  );
};