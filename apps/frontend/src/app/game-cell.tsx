import { useState } from 'react';
import { trpc } from './trpc';

type Props = {
  row: number;
  col: number;
};

export const GameCell = ({row, col}: Props) => {
  const [content, setContent] = useState('❓');

  const revealCell = trpc.useMutation('openCell');

  trpc.useSubscription(['cellOpened', {row, col}], {
    onNext(content) {
      setContent(content);
    }
  });

  const handleCellButtonClick = () => {
    revealCell.mutateAsync({row, col});
  }

  return (
    <button onClick={handleCellButtonClick}>
      {content}
    </button>
  );
};