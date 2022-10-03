import { GameUiState } from '@memory/shared';
import { useState } from 'react';
import { GameField } from './game-field';
import { trpc } from '../trpc';

type Props = {
  playerName: string;
};

export const GameLobby = ({playerName}: Props) => {
  const [players, setPlayers] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameUiState | null>(null);

  const startGame = trpc.useMutation('startGame');

  trpc.useSubscription(['joinedPlayersChange', {playerName}], {
    onNext(joinedPlayers) {
      setPlayers(joinedPlayers);
    },
  });

  trpc.useSubscription(['gameStateChange'], {
    onNext(newGameState: GameUiState) {
      setGameState(newGameState);
    }
  });

  const handleStartButtonClick = () => {
    startGame.mutateAsync({fieldSize: 4});
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

      {gameState && <GameField state={gameState} />}
    </section>
  );
};