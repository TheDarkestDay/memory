import { useParams } from 'react-router-dom';
import { useAppStore } from '../store';
import { trpc } from '../trpc';

type Props = {
  row: number;
  col: number;
  content: string;
};

export const GameCell = ({row, col, content}: Props) => {
  const { gameId } = useParams();
  const playerName = useAppStore((state) => state.playerName);
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