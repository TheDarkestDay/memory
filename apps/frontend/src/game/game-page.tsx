import { ChangeEvent, FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';

import { GameLobby } from './game-lobby';
import { useAppStore } from '../store';
import { trpc } from '../trpc';

export const GamePage = () => {
  const { gameId } = useParams();

  const playerName = useAppStore((state) => state.playerName);
  const setPlayerName = useAppStore((state) => state.setPlayerName);

  const [isFormSubmitted, setFormSubmitted] = useState<boolean>(false);
  const joinGame = trpc.useMutation('joinGame');

  const handlePlayerFormSubmit = (event: FormEvent) => {
    event.preventDefault();

    joinGame.mutateAsync({playerName})
      .then(() => {
        setFormSubmitted(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPlayerName(event.target.value);
  };

  return (
    <main>
      <h1>Memory</h1>

      <form onSubmit={handlePlayerFormSubmit}>
        <label htmlFor="name">Your name: </label>
        <input id="name" type="text" value={playerName} onChange={handleNameChange} />
      </form>

      {
        isFormSubmitted && <GameLobby playerName={playerName} />
      }
    </main>
  );
};