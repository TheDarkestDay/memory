import { css } from '@emotion/react';
import { GameUiState } from '@memory/shared';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { Button } from '../common/button';
import { FlexRow } from '../layout';
import { trpc } from '../trpc';
import { GameField } from './game-field';
import { PlayersList } from './players-list';

const styles = {
  logo: css({
    color: '#152938',
  }),
  main: css({
    minHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    padding: '2.5rem 5rem'
  }),
  fieldSection: css({
    flexGrow: 1,
    marginBottom: '6rem'
  }),
  controls: css({
    marginLeft: 'auto'
  })
};

type PageParams = {
  gameId: string;
}

export const GamePage = () => {
  const { gameId = '' } = useParams<PageParams>();

  const [gameState, setGameState] = useState<GameUiState | null>(null);

  trpc.useSubscription(['gameStateChange', {gameId}], {
    onNext(newGameState) {
      setGameState(newGameState);
    }
  });

  const startGame = trpc.useMutation('startGame');

  const handleStartButtonClick = () => {
    startGame.mutateAsync({gameId});
  };

  return (
    <main css={styles.main}>
      <FlexRow>
        <h1>
          memory
        </h1>

        <FlexRow gap="1rem" styles={styles.controls}>
          <Button onClick={handleStartButtonClick} variant="primary">
            Start
          </Button>

          <Button to="/" variant="secondary">
            New Game
          </Button>
        </FlexRow>
      </FlexRow>

      <section css={styles.fieldSection}>
        {gameState && <GameField state={gameState} />}
      </section>

      <PlayersList activePlayerName={gameState?.currentPlayer} scores={gameState?.scores} />
    </main>
  );
};