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

        const { context } = state;
        const { currentPlayer, revealedCells, field } = context;

        const lastRevealedCell = revealedCells[revealedCells.length - 1];
        if (lastRevealedCell != null) {
            const [row, col] = lastRevealedCell;
            const cellContent = field[row][col];

            this.memorizeCharacterLocation(cellContent, lastRevealedCell);
            this.removeCellFromNotYetRevealedCells(lastRevealedCell);
        }

        switch (value) {
            case 'firstCellRevealed':
            case 'noCellsRevealed': {
                if (currentPlayer !== this.name) {
                    return;
                }

                const foundMatch = Object.values(this.charactersLocations)
                    .find((cells) => cells.length === 2);

                if (foundMatch != null) {
                    const [[row, col]] = foundMatch.filter(([matchingRow, matchingCol]) => {
                        return revealedCells.every(([revealedRow, revealedCol]) => {
                            return revealedRow !== matchingRow && revealedCol !== matchingCol;
                        });
                    });

                    this.notifyListeners({ playerName: this.name, row, col });
                } else {
                    const randomPositionIndex = getRandomNumber(0, this.notYetRevealedCells.length - 1);
                    if (this.notYetRevealedCells.length === 0) {
                        return;
                    }

                    const [[row, col]] = this.notYetRevealedCells.splice(randomPositionIndex, 1);
                    this.notifyListeners({ playerName: this.name, row, col });
                }
                break;
            }
            case 'secondCellRevealed': {
                const [[rowA, colA]] = revealedCells;
                const [rowB, colB] = lastRevealedCell;

                const cellAContent = field[rowA][colA];
                if (cellAContent === field[rowB][colB]) {
                    delete this.charactersLocations[cellAContent];
                }

                return;
            }
            default:
                return;
        }
    }

    addActionListener(listener: ActionListener) {
        this.listeners.push(listener);
    }

    private notifyListeners(event: RevealNextCellEvent) {
        this.listeners.forEach((listener) => listener(event));
    }

    private removeCellFromNotYetRevealedCells([row, col]: [number, number]) {
        const cellIndex = this.notYetRevealedCells.findIndex(([cellRow, cellCol]) => cellRow === row && cellCol === col);

        if (cellIndex !== -1) {
            this.notYetRevealedCells.splice(cellIndex, 1);
        }
    }

    private memorizeCharacterLocation(cellContent: string, [cellRow, cellCol]: [number, number]) {
        if (this.charactersLocations[cellContent] == null) {
            this.charactersLocations[cellContent] = [];
        }

        const isThisCellAlreadMemorized = this.charactersLocations[cellContent].some(([row, col]) => row === cellRow && col === cellCol);

        if (!isThisCellAlreadMemorized) {
            this.charactersLocations[cellContent].push([cellRow, cellCol]);
        }
    }

    private stateChangeHandler = this.handleStateChange.bind(this);

    private charactersLocations: Record<string, [number, number][]> = {};

    private notYetRevealedCells: [number, number][] = [];

    private listeners: ActionListener[] = [];
}