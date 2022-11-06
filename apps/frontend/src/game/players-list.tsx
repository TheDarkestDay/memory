import { Player } from '@memory/shared';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { css } from '@emotion/react';
import { FlexRow } from '../layout';

import { trpc } from '../trpc';
import { useMediaQuery } from '../common/use-media-query';

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
    width: '4rem',
    backgroundColor: '#dfe7ec',
    padding: '0.625rem 0.875rem',
    '--name-color': '#7191a5',
    '--score-color': '#304859',
    '@media (min-width: 768px)': {
      padding: '1.5rem 1rem',
      width: '10.25rem',
      alignItems: 'flex-start'
    },
    '@media (min-width: 1024px)': {
      width: '15rem',
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

  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  trpc.useSubscription(['joinedPlayersChange', { gameId }], {
    onNext(joinedPlayers) {
      setPlayers(joinedPlayers);
    },
  });

  return (
    <FlexRow component="ul" styles={styles.root} gap="1.75rem" alignItems="stretch">
      {players.map((player) => {
        const { name, isRobot, shortName } = player;

        const playerStyles = css(
          styles.player,
          name === activePlayerName && styles.activePlayer
        );

        const shouldShowRobotIcon = isRobot && !isSmallScreen;

        return (
          <li
            key={player.id}
            css={playerStyles}
          >
            <span css={styles.name}>{isSmallScreen ? shortName : name} {shouldShowRobotIcon && '🤖'}</span>
            <span css={styles.score}>{scores[player.name] ?? 0}</span>
          </li>
        );
      })}
    </FlexRow>
  );
};
