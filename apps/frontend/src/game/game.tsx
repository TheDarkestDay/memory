import { css } from '@emotion/react';
import { GameInfoForPlayer, GameUiState } from '@memory/shared';
import { useCallback, useState } from 'react';
import { useLoaderData, useParams } from 'react-router-dom';

import { Button } from '../common/button';
import { FlexRow } from '../layout';
import { trpc } from '../trpc';
import { Announcer } from './announcer';
import { MobileMenuDialog } from './mobile-menu-dialog';
import { MultiplayerGame } from './multiplayer-game';
import { TimeAttack } from './time-attack';

const styles = {
  header: css({
    marginBottom: '5rem',
    '@media (min-width: 768px)': {
      marginBottom: '7.5rem'
    },
    '@media (min-width: 1024px)': {
      marginBottom: '5.5rem'
    }
  }),
  logo: css({
    color: '#152938',
    fontSize: '1.5rem',
    '@media (min-width: 768px)': {
      fontSize: '2.5rem'
    }
  }),
  main: css({
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    '@media (min-width: 768px)': {
      padding: '2.5rem'
    },
    '@media (min-width: 1440px)': {
      padding: '4.1875rem 10.3125rem'
    }
  }),
  controls: css({
    display: 'none',
    marginLeft: 'auto',
    '@media (min-width: 768px)': {
      display: 'flex'
    }
  }),
  menuButton: css({
    display: 'block',
    marginLeft: 'auto',
    '@media (min-width: 768px)': {
      display: 'none'
    }
  })
};

type PageParams = {
  gameId: string;
}

export const Game = () => {
  const { gameId = '' } = useParams<PageParams>();
  const { playersCount } = useLoaderData() as GameInfoForPlayer;

  const [gameState, setGameState] = useState<GameUiState | null>(null);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);

  trpc.useSubscription(['gameStateChange', {gameId}], {
    onNext(newGameState) {
      setGameState(newGameState);
    }
  });

  const { mutateAsync: startGame } = trpc.useMutation('startGame');
  const { mutateAsync: restartGame } = trpc.useMutation('restartGame');

  const isGameFinished = gameState?.phase === 'finished' ?? false;

  const handleStartButtonClick = () => {
    if (isGameFinished) {
      restartGame({gameId});
    } else {
      startGame({gameId});
    }

    if (isMenuDialogOpen) {
      setIsMenuDialogOpen(false);
    }
  };

  const handleDialogRestartButtonClick = () => {
    restartGame({gameId});
  };

  const handleTimeAttackReady = useCallback(() => {
    if (gameId !== '') {
      startGame({gameId});
    }
  }, [gameId, startGame]);

  const handleMenuButtonClick = () => {
    setIsMenuDialogOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuDialogOpen(false);
  };

  const startGameButtonLabel = isGameFinished 
    ? 'Restart game' 
    : 'Start game';

  return (
    <main css={styles.main}>
      <FlexRow component="header" styles={styles.header}>
        <h1 css={styles.logo}>
          memory
        </h1>

        <FlexRow gap="1rem" styles={styles.controls}>
          <Button onClick={handleStartButtonClick} variant="primary">
            {startGameButtonLabel}
          </Button>

          <Button to="/" variant="secondary">
            New Game
          </Button>
        </FlexRow>

        <Button onClick={handleMenuButtonClick} variant="primary" styles={styles.menuButton}>
          Menu
        </Button>
      </FlexRow>

      {
        playersCount === 1
          ? <TimeAttack gameState={gameState} onReady={handleTimeAttackReady} onRestart={handleDialogRestartButtonClick} />
          : <MultiplayerGame gameId={gameId} isGameFinished={isGameFinished} gameState={gameState} onRestart={handleDialogRestartButtonClick} />
      }

      {
        isMenuDialogOpen && <MobileMenuDialog isGameFinished={isGameFinished} onStartButtonClick={handleStartButtonClick} onClose={handleMenuClose} />
      }

      <Announcer gameState={gameState} />
    </main>
  );
};