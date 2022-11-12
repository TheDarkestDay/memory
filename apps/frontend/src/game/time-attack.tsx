import { css } from "@emotion/react";
import { GameUiState } from "@memory/shared";
import { useEffect } from "react";
import { Banner } from "../common/banner";
import { BannerTitle } from "../common/banner-title";
import { BannerValue } from "../common/banner-value";
import { formatTime } from "../common/format-time";
import { FlexRow } from "../layout";

import { GameField } from "./game-field";
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
    const isGameInProgress = gameState?.phase !== 'finished';
    const timePassed = useTimer(isGameInProgress);
    const formattedTime = formatTime(timePassed);

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
                        0
                    </BannerValue>
                </Banner>
            </FlexRow>
        </>
    );
};