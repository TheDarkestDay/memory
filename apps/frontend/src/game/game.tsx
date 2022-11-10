import { css } from '@emotion/react';
import { GameUiState } from '@memory/shared';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '../common/button';
import { IconButton } from '../common/icon-button';
import { FlexRow } from '../layout';
import { trpc } from '../trpc';
import { GameField } from './game-field';
import { GameResultsDialog } from './game-results-dialog';
import { MobileMenuDialog } from './mobile-menu-dialog';
import { PlayersList } from './players-list';

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
  fieldSection: css({
    flexGrow: 1,
    marginBottom: '6rem'
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
  }),
  instruction: css({
    width: '100%',
    fontSize: '1.5rem',
    textAlign: 'center',
    '@media (min-width: 768px)': {
      width: '40rem',
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  }),
  gameLink: css({
    wordBreak: 'break-word',
    backgroundColor: '#dfe7ec',
    borderRadius: '4px',
    padding: '0.5rem'
  })
};

type PageParams = {
  gameId: string;
}

export const Game = () => {
  const { gameId = '' } = useParams<PageParams>();

  const [gameState, setGameState] = useState<GameUiState | null>(null);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);

  trpc.useSubscription(['gameStateChange', {gameId}], {
    onNext(newGameState) {
      setGameState(newGameState);
    }
  });

  const startGame = trpc.useMutation('startGame');
  const restartGame = trpc.useMutation('restartGame');

  const isGameFinished = gameState?.phase === 'finished' ?? false;

  const handleStartButtonClick = () => {
    if (isGameFinished) {
      restartGame.mutateAsync({gameId});
    } else {
      startGame.mutateAsync({gameId});
    }

    if (isMenuDialogOpen) {
      setIsMenuDialogOpen(false);
    }
  };

  const handleDialogRestartButtonClick = () => {
    restartGame.mutateAsync({gameId});
  };

  const handleMenuButtonClick = () => {
    setIsMenuDialogOpen(true);
  };

  const handleMenuClose = () => {
    setIsMenuDialogOpen(false);
  };

  const handleCopyGameUrlButtonClick = async () => {
    try {
      await navigator.clipboard.writeText(gameUrl);
    } catch (error) {
      console.error('Failed to write game URL to clipboard due to: ', error);
    }
  };

  const startGameButtonLabel = isGameFinished 
    ? 'Restart game' 
    : 'Start game';

  const gameUrl = `https://${process.env.NX_APP_DOMAIN}/game/${gameId}`;

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
        gameState == null &&
          <section css={styles.instruction}>
            <p>
              Invite friends by sending them this link:
            </p>
            <FlexRow styles={styles.gameLink}>
              {gameUrl}

              <IconButton icon='copy' onClick={handleCopyGameUrlButtonClick} />
            </FlexRow>
            <p>or press "Start game" right away to play against AI.</p>
          </section>
      }

      <section css={styles.fieldSection}>
        {gameState && <GameField state={gameState} />}
      </section>

      <PlayersList activePlayerName={gameState?.currentPlayer} scores={gameState?.scores} />

      {
        isGameFinished && <GameResultsDialog onRestart={handleDialogRestartButtonClick} scores={gameState?.scores ?? {john: 3, robert: 5, alice: 6, kirk: 1}} />
      }

      {
        isMenuDialogOpen && <MobileMenuDialog isGameFinished={isGameFinished} onStartButtonClick={handleStartButtonClick} onClose={handleMenuClose} />
      }
    </main>
  );
};