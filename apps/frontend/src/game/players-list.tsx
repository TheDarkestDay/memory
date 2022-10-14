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
    listStyleType: 'none',
  }),
  player: css({
    minWidth: '15rem',
    padding: '1.5rem 1rem',
    backgroundColor: '#dfe7ec',
    '--name-color': '#7191a5',
    '--score-color': '#304859',
  }),
  activePlayer: css({
    backgroundColor: '#fda214',
    '--name-color': '#fcfcfc',
    '--score-color': '#fcfcfc',
  }),
  name: css({
    color: 'var(--name-color)',
    fontSize: '1.25rem',
    fontWeight: 'bold',
  }),
  score: css({
    color: 'var(--score-color)',
    fontSize: '2rem',
  }),
};

type Props = {
  activePlayerName?: string;
  scores?: Record<string, number>;
};

export const PlayersList = ({ activePlayerName, scores = {} }: Props) => {
  const { gameId = '' } = useParams();
  const [players, setPlayers] = useState<Player[]>([]);

  trpc.useSubscription(['joinedPlayersChange', { gameId }], {
    onNext(joinedPlayers) {
      setPlayers(joinedPlayers);
    },
  });

  return (
    <FlexRow component="ul" styles={styles.root} gap="1.75rem">
      {players.map((player) => {
        const playerStyles = css(
          styles.player,
          player.name === activePlayerName && styles.activePlayer
        );

        return (
          <FlexRow
            component="li"
            key={player.id}
            justifyContent="space-between"
            styles={playerStyles}
          >
            <span css={styles.name}>{player.name}</span>
            <span css={styles.score}>{scores[player.name] ?? 0}</span>
          </FlexRow>
        );
      })}
    </FlexRow>
  );
};
