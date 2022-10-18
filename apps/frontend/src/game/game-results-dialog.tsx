import { css } from '@emotion/react';

import { Button } from '../common/button';
import { Dialog } from '../common/dialog';
import { FlexItem, FlexRow } from '../layout';

type Props = {
  scores: Record<string, number>;
  onRestart: () => void;
};

const playersScore = {
  '--bg-color': '#dfe7ec',
  '--name-color': '#7191a5',
  '--score-color': '#304859',
  padding: '1rem 2rem',
  backgroundColor: 'var(--bg-color)',
  borderRadius: '10px',
};

const styles = {
  dialog: css({
    minWidth: '40rem'
  }),
  title: css({
    textAlign: 'center',
    fontSize: '48px',
    marginBottom: '1rem',
    marginTop: '0',
  }),
  subtitle: css({
    marginBottom: '2.5rem',
    textAlign: 'center',
    fontSize: '18px',
    color: '#7191a5'
  }),
  scoreboard: css({
    marginBlockStart: 0,
    marginBlockEnd: 0,
    paddingInlineStart: 0,
    paddingBottom: '3rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    listStyle: 'none',
  }),
  playerScore: css(playersScore),
  winnersPlayerScore: css({
    ...playersScore,
    '--bg-color': '#152938',
    '--name-color': '#fcfcfc',
    '--score-color': '#fcfcfc',
  }),
  playerName: css({
    fontSize: '1.25rem',
    color: 'var(--name-color)',
  }),
  scoreCount: css({
    fontSize: '2rem',
    color: 'var(--score-color)',
  })
};

export const GameResultsDialog = ({ scores, onRestart }: Props) => {
  const entries = Object.entries(scores);
  const sortedEntries = entries.sort(([, scoreA], [, scoreB]) => scoreB - scoreA);
  const [[winnerName, winnerScore], ...others] = sortedEntries;

  return (
    <Dialog styles={styles.dialog}>
      <h2 css={styles.title}>{winnerName} wins!</h2>

      <p css={styles.subtitle}>Game over! Here are the results...</p>

      <ul css={styles.scoreboard}>
        <FlexRow styles={styles.winnersPlayerScore} component="li" justifyContent="space-between">
          <span css={styles.playerName}>{winnerName}</span>
          <span css={styles.scoreCount}>{winnerScore} Pairs</span>
        </FlexRow>
        {
          others.map(([name, score]) => (
            <FlexRow key={name} styles={styles.playerScore} component="li" justifyContent="space-between">
              <span css={styles.playerName}>{name}</span>
              <span css={styles.scoreCount}>{score} Pairs</span>
            </FlexRow>
          ))
        }
      </ul>

      <FlexRow gap="1rem">
        <FlexItem>
          <Button onClick={onRestart} fullWidth variant="primary">Restart</Button>
        </FlexItem>

        <FlexItem>
          <Button to="/" fullWidth variant="secondary">Setup New Game</Button>
        </FlexItem>
      </FlexRow>
    </Dialog>
  );
};
