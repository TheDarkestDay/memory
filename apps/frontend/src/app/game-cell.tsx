import { trpc } from './trpc';

type Props = {
  row: number;
  col: number;
  content: string;
};

export const GameCell = ({row, col, content}: Props) => {
  const revealCell = trpc.useMutation('openCell');

  const handleCellButtonClick = () => {
    revealCell.mutateAsync({row, col});
  }

  return (
    <button onClick={handleCellButtonClick}>
      {content}
    </button>
  );
};