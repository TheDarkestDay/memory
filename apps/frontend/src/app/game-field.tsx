import { GameCell } from './game-cell';

type Props = {
  size: number;
}

export const GameField = ({size}: Props) => {
  let cells = [];
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      cells.push(
        <GameCell key={`${i}-${j}`} row={i} col={j} />
      );
    }
  }

  return (
    <section>
      {cells}
    </section>
  );
};