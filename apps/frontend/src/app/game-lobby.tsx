import { useState } from 'react';
import { GameField } from './game-field';
import { trpc } from './trpc';

type Props = {
  playerName: string;
};

export const GameLobby = ({playerName}: Props) => {
  const [players, setPlayers] = useState<string[]>([]);
  const [isGameStarted, setGameStarted] = useState(false);
  const [fieldSize, setFieldSize] = useState(0);

  const startGame = trpc.useMutation('startGame');

  trpc.useSubscription(['joinedPlayersChange', {playerName}], {
    onNext(joinedPlayers) {
      setPlayers(joinedPlayers);
    },
  });

  trpc.useSubscription(['gameStart'], {
    onNext(gameSize: number) {
      setFieldSize(gameSize);
      setGameStarted(true);
    }
  });

  const handleStartButtonClick = () => {
    startGame.mutateAsync({fieldSize: 4})
      .then(() => setGameStarted(true));
  };
  
  return (
    <section>
      <h2>
        Connected players
      </h2>

      <ul>
        {players.map((player) => <li key={player}>{player}</li>)}
      </ul>

      <button onClick={handleStartButtonClick}>
        Start game
      </button>

      {isGameStarted && <GameField size={fieldSize} />}
    </section>
  );
};