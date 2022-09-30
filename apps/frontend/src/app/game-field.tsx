import { GameUiState } from '@memory/shared';

import { GameCell } from './game-cell';

type Props = {
  state: GameUiState;
}

export const GameField = ({state}: Props) => {
  const { field, players, scores, currentPlayer} = state;

  const cells = [];

  for (let i = 0; i < field.length; i++) {
    for (let j = 0; j < field.length; j++) {
      cells.push(
        <GameCell key={`${i}-${j}`} row={i} col={j}  content={field[i][j]} />
      );
    }
  }

  return (
    <section>
      <h2>
        It is {currentPlayer}'s turn
      </h2>

      {cells}

      <table>
        <thead>
          <tr>
            <th scope="col">
              Player name
            </th>
            <th scope="col">
              Score
            </th>
          </tr>
        </thead>
        <tbody>
          {
            players.map((playerName) => (
              <tr key={playerName}>
                <td>{playerName}</td>
                <td>{scores[playerName]}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
    </section>
  );
};