import { useAppStore } from './store';
import { trpc } from './trpc';

type Props = {
  row: number;
  col: number;
  content: string;
};

export const GameCell = ({row, col, content}: Props) => {
  const playerName = useAppStore((state) => state.playerName);
  const revealCell = trpc.useMutation('openCell');

  const handleCellButtonClick = () => {
    revealCell.mutateAsync({row, col, playerName});
  }

  return (
    <button onClick={handleCellButtonClick}>
      {content}
    </button>
  );
};