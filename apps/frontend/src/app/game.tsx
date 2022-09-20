import { useEffect, useState } from 'react';

import { trpc } from './trpc';

export const Game = () => {
  const [players, setPlayers] = useState<string[]>([]);
  const joinGame = trpc.useMutation('joinGame');

  useEffect(() => {
    joinGame.mutateAsync()
      .then(() => console.log('Joined game'))
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // trpc.useSubscription(['onPlayerJoined', undefined], {
  //   onNext(joinedPlayers) {
  //     console.log(`Got something from subscription: ${joinedPlayers}`);
  //     setPlayers(joinedPlayers);
  //   }
  // });

  return (
    <main>
      <h1>Memory</h1>

      <p>
        Connected players
      </p>

      <ul>
        {players.map((player) => <li key={player}>{player}</li>)}
      </ul>
    </main>
  );
};