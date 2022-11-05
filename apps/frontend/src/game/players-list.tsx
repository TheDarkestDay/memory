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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: '1',
    padding: '1.5rem 1rem',
    backgroundColor: '#dfe7ec',
    '--name-color': '#7191a5',
    '--score-color': '#304859',
    '@media (min-width: 768px)': {
      alignItems: 'flex-start'
    },
    '@media (min-width: 1024px)': {
      flexGrow: '0',
      minWidth: '15rem',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    }
  }),
  activePlayer: css({
    backgroundColor: '#fda214',
    '--name-color': '#fcfcfc',
    '--score-color': '#fcfcfc',
  }),
  name: css({
    color: 'var(--name-color)',
    fontSize: '0.9375rem',
    fontWeight: 'bold',
    '@media (min-width: 1024px)': {
      fontSize: '1.25rem'
    }
  }),
  score: css({
    color: 'var(--score-color)',
    fontSize: '1.5rem',
    '@media (min-width: 1024px)': {
      fontSize: '2rem'
    },
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
          <li
            key={player.id}
            css={playerStyles}
          >
            <span css={styles.name}>{player.name}</span>
            <span css={styles.score}>{scores[player.name] ?? 0}</span>
          </li>
        );
      })}
    </FlexRow>
  );
};
