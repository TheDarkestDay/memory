import { Player } from '@memory/shared';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { css } from '@emotion/react';
import { FlexRow } from '../layout';

import { trpc } from '../trpc';

const styles = {
  root: css({
    marginBlockStart: 0,
    marginBlockEnd: 0,
    paddingInlineStart: 0,
    listStyleType: 'none'
  }),
  player: css({
    minWidth: '15rem',
    padding: '1.5rem 1rem',
    backgroundColor: '#dfe7ec',
    color: '#7191a5'
  }),
  name: css({
    fontSize: '1.25rem',
  }),
  score: css({
    color: '#304859',
    fontSize: '2rem'
  })
};

type Props = {
  activePlayerName?: string;
  scores?: Record<string, number>;
};

export const PlayersList = ({activePlayerName, scores = {}}: Props) => {
  const { gameId = '' } = useParams();
  const [players, setPlayers] = useState<Player[]>([]);

  trpc.useSubscription(['joinedPlayersChange', {gameId}], {
    onNext(joinedPlayers) {
      setPlayers(joinedPlayers);
    },
  });

  return (
    <FlexRow component="ul" styles={styles.root} gap="1.75rem">
      {
        players.map((player) => (
          <FlexRow component="li" key={player.id} justifyContent='space-between' styles={styles.player}>
            <span css={styles.name}>{player.name}</span>
            <span css={styles.score}>{scores[player.name] ?? 0}</span>
          </FlexRow>
        ))
      }
    </FlexRow>
  );
};