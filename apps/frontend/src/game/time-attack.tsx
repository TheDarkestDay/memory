import { css } from "@emotion/react";
import { GameUiState } from "@memory/shared";
import { useEffect } from "react";

import { GameField } from "./game-field";

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
    useEffect(() => {
        onReady();        
    }, [onReady]);

    return (
        <>
            <section css={styles.fieldSection}>
                {gameState && <GameField state={gameState} />}
            </section>
        </>
    );
};