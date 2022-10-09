import { GameUiState, Player } from '@memory/shared';
import { useParams } from 'react-router-dom';
import { useState } from 'react';

import { GameField } from './game-field';
import { trpc } from '../trpc';

export const GameLobby = () => {
  const { gameId } = useParams();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameUiState | null>(null);

  const startGame = trpc.useMutation('startGame');

  trpc.useSubscription(['joinedPlayersChange', {gameId}], {
    onNext(joinedPlayers) {
      setPlayers(joinedPlayers);
    },
  });

  trpc.useSubscription(['gameStateChange', {gameId}], {
    onNext(newGameState) {
      setGameState(newGameState);
    }
  });

  const handleStartButtonClick = () => {
    startGame.mutateAsync({gameId});
  };
  
  return (
    <section>
      <h2>
        Connected players
      </h2>

      <ul>
        {players.map(({id, name}) => <li key={id}>{name}</li>)}
      </ul>

      <button onClick={handleStartButtonClick}>
        Start game
      </button>

      {gameState && <GameField state={gameState} />}
    </section>
  );
};