import { GameUiState } from '@memory/shared';
import { useParams } from 'react-router-dom';
import { useState } from 'react';

import { GameField } from './game-field';
import { trpc } from '../trpc';
import { useAppStore } from '../store';

export const GameLobby = () => {
  const { gameId } = useParams();
  const setPlayerName = useAppStore((store) => store.setPlayerName);
  const [players, setPlayers] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameUiState | null>(null);

  const startGame = trpc.useMutation('startGame');

  trpc.useSubscription(['joinedPlayersChange', {gameId}], {
    onNext(joinedPlayers) {
      setPlayers(joinedPlayers);
    },
  });

  trpc.useSubscription(['gameStateChange', {gameId}], {
    onNext(newGameState: GameUiState | string | null) {
      if (typeof newGameState === 'string') {
        setPlayerName(newGameState);
      } else {
        setGameState(newGameState);
      }
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
        {players.map((player) => <li key={player}>{player}</li>)}
      </ul>

      <button onClick={handleStartButtonClick}>
        Start game
      </button>

      {gameState && <GameField state={gameState} />}
    </section>
  );
};