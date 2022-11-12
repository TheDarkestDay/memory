import { Player } from '@memory/shared';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { css } from '@emotion/react';
import { FlexRow } from '../layout';

import { trpc } from '../trpc';
import { useMediaQuery } from '../common/use-media-query';
import { BannerValue } from '../common/banner-value';
import { Banner } from '../common/banner';
import { BannerTitle } from '../common/banner-title';

const styles = {
  root: css({
    marginBlockStart: 0,
    marginBlockEnd: 0,
    paddingInlineStart: 0,
    listStyleType: 'none',
  })
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

        const isActivePlayer = name === activePlayerName;
        const playerBannerColor = isActivePlayer ? 'accent' : 'primary';

        const shouldShowRobotIcon = isRobot && !isSmallScreen;

        return (
          <Banner
            key={player.id}
            color={playerBannerColor}
            showArrow={isActivePlayer}
          >
            <BannerTitle>{isSmallScreen ? shortName : name} {shouldShowRobotIcon && '🤖'}</BannerTitle>
            <BannerValue>{scores[player.name] ?? 0}</BannerValue>
          </Banner>
        );
      })}
    </FlexRow>
  );
};
