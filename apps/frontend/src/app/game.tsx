import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { GameLobby } from './game-lobby';

import { trpc } from './trpc';

export const Game = () => {
  const [isFormSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [playerName, setPlayerName] = useState<string>('');
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