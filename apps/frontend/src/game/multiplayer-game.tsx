import { css } from '@emotion/react';
import { GameUiState } from "@memory/shared";

import { IconButton } from '../common/icon-button';
import { FlexRow } from '../layout';
import { GameField } from './game-field';
import { GameResultsDialog } from './game-results-dialog';
import { PlayersList } from './players-list';

type Props = {
    gameState: GameUiState | null;
    gameId: string;
    isGameFinished: boolean;
    onRestart: () => void;
};

const styles = {
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
    }),
    fieldSection: css({
        flexGrow: 1,
        marginBottom: '6rem'
    })
};

export const MultiplayerGame = ({ gameState, gameId, onRestart, isGameFinished }: Props) => {
    const gameUrl = `https://${process.env.NX_APP_DOMAIN}/game/${gameId}`;

    const handleCopyGameUrlButtonClick = async () => {
        try {
            await navigator.clipboard.writeText(gameUrl);
        } catch (error) {
            console.error('Failed to write game URL to clipboard due to: ', error);
        }
    };

    return (
        <>
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
                isGameFinished && <GameResultsDialog onRestart={onRestart} scores={gameState?.scores ?? { john: 3, robert: 5, alice: 6, kirk: 1 }} />
            }
        </>
    );
};