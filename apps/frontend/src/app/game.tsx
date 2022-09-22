import { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import { trpc } from './trpc';

export const Game = () => {
  const [playerName, setPlayerName] = useState<string>('');
  const [players, setPlayers] = useState<string[]>([]);
  const joinGame = trpc.useMutation('joinGame');

  const handlePlayerFormSubmit = (event: FormEvent) => {
    event.preventDefault();

    joinGame.mutateAsync({playerName})
      .then(() => console.log('Joined game'))
      .catch((error) => {
        console.error(error);
      });
  };

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPlayerName(event.target.value);
  };

  trpc.useSubscription(['onPlayerJoined', undefined], {
    onNext(joinedPlayers) {
      console.log(`Got something from subscription: ${joinedPlayers}`);
      setPlayers(joinedPlayers);
    }
  });

  return (
    <main>
      <h1>Memory</h1>

      <form onSubmit={handlePlayerFormSubmit}>
        <label htmlFor="name">Your name: </label>
        <input id="name" type="text" value={playerName} onChange={handleNameChange} />
      </form>

      <p>
        Connected players
      </p>

      <ul>
        {players.map((player) => <li key={player}>{player}</li>)}
      </ul>
    </main>
  );
};