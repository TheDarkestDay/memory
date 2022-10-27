import { GameContext, GameService, getRandomNumber } from "@memory/shared";
import { State, AnyEventObject } from "xstate";

const ACTIONS_DELAY = 750;

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
    }

    private handleStateChange(state: State<GameContext, AnyEventObject>) {
        const { value } = state;

        if (value === 'finished') {
            return;
        }

        const { context } = state;
        const { currentPlayer, revealedCells, field } = context;

        if (currentPlayer !== this.name) {
            const lastRevealedCell = revealedCells[revealedCells.length - 1];
            const [row, col] = lastRevealedCell;
            const cellContent = field[row][col];

            if (this.charactersLocations[cellContent] == null) {
                this.charactersLocations[cellContent] = [];
            }

            this.charactersLocations[cellContent].push(lastRevealedCell);
        } else {
           const foundMatch = Object.values(this.charactersLocations)
            .find((cells) => cells.length === 2);

           if (foundMatch) {
            const [[rowA, colA], [rowB, colB]] = foundMatch;
            this.gameService.send({type: 'REVEAL_NEXT_CELL', playerName: this.name, row: rowA, col: colA});

           } else {
            const randomPositionIndex = getRandomNumber(0, this.notYetRevealedCells.length);
            const [row, col] = this.notYetRevealedCells.splice(randomPositionIndex, 1);

            this.gameService.send({type: 'REVEAL_NEXT_CELL', playerName: this.name, row, col});
           } 
        }
    }

    private stateChangeHandler = this.handleStateChange.bind(this);

    private charactersLocations: Record<string, [number, number][]> = {};

    private notYetRevealedCells: [number, number][] = [];
}