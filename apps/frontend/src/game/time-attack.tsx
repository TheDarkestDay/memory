import { css } from "@emotion/react";
import { GameUiState } from "@memory/shared";
import { useEffect } from "react";
import { Banner } from "../common/banner";
import { BannerTitle } from "../common/banner-title";
import { BannerValue } from "../common/banner-value";
import { formatTime } from "../common/format-time";
import { FlexRow } from "../layout";

import { GameField } from "./game-field";
import { TimeAttackResultsDialog } from "./time-attack-results-dialog";
import { useTimer } from "./use-timer";

type Props = {
    gameState: GameUiState | null;
    onRestart: () => void;
    onReady: () => void;
};

const styles = {
    fieldSection: css({
        flexGrow: 1,
        marginBottom: '6rem'
    })
};

export const TimeAttack = ({ gameState, onRestart, onReady }: Props) => {
    const movesCount = gameState?.movesCount ?? 0;

    const isGameInProgress = gameState?.phase !== 'finished';
    const isGameFinished = gameState?.phase === 'finished';
    const {elapsedSeconds, reset} = useTimer(isGameInProgress);
    const formattedTime = formatTime(elapsedSeconds);

    const handleRestartButtonClick = () => {
        reset();
        onRestart();
    };

    useEffect(() => {
        onReady();        
    }, [onReady]);

    return (
        <>
            <section css={styles.fieldSection}>
                {gameState && <GameField state={gameState} />}
            </section>

            <FlexRow gap="1.75rem" justifyContent="center">
                <Banner>
                    <BannerTitle>
                        Time
                    </BannerTitle>

                    <BannerValue>
                        {formattedTime}
                    </BannerValue>
                </Banner>

                <Banner>
                    <BannerTitle>
                        Moves
                    </BannerTitle>

                    <BannerValue>
                        {movesCount}
                    </BannerValue>
                </Banner>
            </FlexRow>

            {
                isGameFinished && <TimeAttackResultsDialog movesCount={movesCount} time={elapsedSeconds} onRestart={handleRestartButtonClick} />
            }
        </>
    );
};