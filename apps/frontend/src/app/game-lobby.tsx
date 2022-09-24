import { useState } from 'react';
import { trpc } from './trpc';

type Props = {
  playerName: string;
};

export const GameLobby = ({playerName}: Props) => {
  const [players, setPlayers] = useState<string[]>([]);

  trpc.useSubscription(['joinedPlayersChange', {playerName}], {
    onNext(joinedPlayers) {
      console.log(`Got something from subscription: ${joinedPlayers}`);
      setPlayers(joinedPlayers);
    },
  });
  
  return (
    <section>
      <h2>
        Connected players
      </h2>

      <ul>
        {players.map((player) => <li key={player}>{player}</li>)}
      </ul>
    </section>
  );
};