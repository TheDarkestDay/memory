import { GameUiState } from "@memory/shared";

import { visuallyHidden } from "../utils";

type Props = {
    gameState: GameUiState | null;
};

const getContentName = (emoji: string) => {
    switch (emoji) {
        case '✅':
            return 'green tick';
        case '✔️':
            return 'gray tick';
        default:
            return emoji;
    }
};

const getMessageForState = (gameState: GameUiState | null) => {
    if (gameState == null) {
        return '';
    }

    const { cellsRevealedThisTurn } = gameState;
    if (cellsRevealedThisTurn.length === 0) {
        const { currentPlayer } = gameState;

        return `It is ${currentPlayer}'s turn`;
    } 

    const lastRevealedCell = cellsRevealedThisTurn[cellsRevealedThisTurn.length - 1];

    if (lastRevealedCell != null) {
        const { field } = gameState;
        const [row, col] = lastRevealedCell;
        const cellContent = field[row][col];
        const contentName = getContentName(cellContent);

        return `${contentName} has been revealed at row ${row + 1} and column ${col + 1}`;
    }

    return '';
};

export const Announcer = ({ gameState }: Props) => {
    return (
        <section aria-live="assertive" css={visuallyHidden}>
            {getMessageForState(gameState)}
        </section>
    );
};