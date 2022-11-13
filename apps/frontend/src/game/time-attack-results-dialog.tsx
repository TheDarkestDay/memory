import { css } from '@emotion/react';
import { Banner } from '../common/banner';
import { BannerTitle } from '../common/banner-title';
import { BannerValue } from '../common/banner-value';

import { Button } from '../common/button';
import { Dialog } from '../common/dialog';
import { formatTime } from '../common/format-time';
import { FlexItem, FlexRow } from '../layout';

type Props = {
    movesCount: number;
    time: number;
    onRestart: () => void;
};

const styles = {
    dialog: css({
        width: 'calc(100% - 3rem)',
        padding: '1.5rem',
        '@media (min-width: 768px)': {
            width: '40rem',
            padding: '3.5rem',
        }
    }),
    title: css({
        textAlign: 'center',
        fontSize: '1.5rem',
        marginBottom: '1rem',
        marginTop: '0',
        '@media (min-width: 768px)': {
            fontSize: '3rem'
        }
    }),
    subtitle: css({
        marginBottom: '2.5rem',
        textAlign: 'center',
        fontSize: '0.937rem',
        color: '#7191a5',
        '@media (min-width: 768px)': {
            fontSize: '1.125rem'
        }
    }),
    scoreboard: css({
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        listStyle: 'none',
        '@media (min-width: 768px)': {
            marginBottom: '3rem'
        }
    }),
    actions: css({
        flexDirection: 'column',
        alignItems: 'stretch',
        '@media (min-width: 768px)': {
            flexDirection: 'row',
        }
    })
};

export const TimeAttackResultsDialog = ({ movesCount, time, onRestart }: Props) => {
    return (
        <Dialog styles={styles.dialog}>
            <h2 css={styles.title}>You did it!</h2>

            <p css={styles.subtitle}>Game over! Here's how you got on...</p>

            <div css={styles.scoreboard}>
                <Banner fullWidth>
                    <BannerTitle>Time Elapsed</BannerTitle>
                    <BannerValue>{formatTime(time)}</BannerValue>
                </Banner>

                <Banner fullWidth>
                    <BannerTitle>Moves Taken</BannerTitle>
                    <BannerValue>{movesCount} Moves</BannerValue>
                </Banner>
            </div>

            <FlexRow styles={styles.actions} gap="1rem">
                <FlexItem basis='50%'>
                    <Button onClick={onRestart} fullWidth variant="primary">Restart</Button>
                </FlexItem>

                <FlexItem basis='50%'>
                    <Button to="/" fullWidth variant="secondary">Setup New Game</Button>
                </FlexItem>
            </FlexRow>
        </Dialog>
    );
};
