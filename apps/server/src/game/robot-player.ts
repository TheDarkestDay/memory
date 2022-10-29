import { GameContext, GameService, getRandomNumber, RevealNextCellEvent } from "@memory/shared";
import { State, AnyEventObject } from "xstate";

type ActionListener = (event: RevealNextCellEvent) => void;

export class RobotPlayer {
    constructor(private name: string, private gameService: GameService) {
    }

    startPlaying() {
        const { field } = this.gameService.getSnapshot().context;
        const rowsCount = field.length;
        const colsCount = field[0].length;

        this.notYetRevealedCells = [];

        for (let i = 0; i < rowsCount; i++) {
            for (let j = 0; j < colsCount; j++) {
                this.notYetRevealedCells.push([i, j]);
            }
        }

        this.gameService.onTransition(this.stateChangeHandler);
    }

    dispose() {
        this.gameService.off(this.stateChangeHandler);
        this.listeners = [];
    }

    private handleStateChange(state: State<GameContext, AnyEventObject>) {
        const { value } = state;

        if (value === 'finished' || value === 'lookingForWinner') {
            return;
        }

        const { context } = state;
        const { currentPlayer, revealedCells, field } = context;

        if (value === 'secondCellRevealed') {
            const [[rowA, colA], [rowB, colB]] = revealedCells;

            const cellAContent = field[rowA][colA];
            if (cellAContent === field[rowB][colB]) {
                delete this.charactersLocations[cellAContent];
            }
        }

        if (currentPlayer !== this.name) {
            const lastRevealedCell = revealedCells[revealedCells.length - 1];
            if (lastRevealedCell == null) {
                return;
            }

            const [row, col] = lastRevealedCell;
            const cellContent = field[row][col];

            if (this.charactersLocations[cellContent] == null) {
                this.charactersLocations[cellContent] = [];
            }

            this.charactersLocations[cellContent].push(lastRevealedCell);
        } else {
            const foundMatch = Object.values(this.charactersLocations)
                .find((cells) => cells.length === 2);

            if (foundMatch != null) {
                const [[row, col]] = foundMatch.slice(revealedCells.length);

                this.notifyListeners({ playerName: this.name, row, col });
            } else {
                const randomPositionIndex = getRandomNumber(0, this.notYetRevealedCells.length - 1);
                if (this.notYetRevealedCells.length === 0) {
                    return;
                }

                const [[row, col]] = this.notYetRevealedCells.splice(randomPositionIndex, 1);
                this.notifyListeners({ playerName: this.name, row, col });
            }
        }
    }

    addActionListener(listener: ActionListener) {
        this.listeners.push(listener);
    }

    private notifyListeners(event: RevealNextCellEvent) {
        this.listeners.forEach((listener) => listener(event));
    }

    private stateChangeHandler = this.handleStateChange.bind(this);

    private charactersLocations: Record<string, [number, number][]> = {};

    private notYetRevealedCells: [number, number][] = [];

    private listeners: ActionListener[] = [];
}