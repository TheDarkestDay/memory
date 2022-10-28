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
        console.log('Robot is handling state change...');
        const { value } = state;

        if (value !== 'playing') {
            return;
        }

        const { context } = state;
        const { currentPlayer, revealedCells, field } = context;

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

           if (foundMatch) {
            console.log('Robot trying to score the match...');
            const [[row, col]] = foundMatch.slice(revealedCells.length);

            setTimeout(() => {
                console.log(`Revealing cell ${row} ${col}`);
                this.gameService.send({type: 'REVEAL_NEXT_CELL', playerName: this.name, row, col});
            }, ACTIONS_DELAY);
           } else {
            console.log('Robot trying to explore unknown cells');
            const randomPositionIndex = getRandomNumber(0, this.notYetRevealedCells.length - 1);
            if (this.notYetRevealedCells.length === 0) {
                return;
            }

            const [[row, col]] = this.notYetRevealedCells.splice(randomPositionIndex, 1);

            setTimeout(() => {
                console.log(`Revealing cell ${row} ${col}`);
                this.gameService.send({type: 'REVEAL_NEXT_CELL', playerName: this.name, row, col});
            }, ACTIONS_DELAY);
           } 
        }
    }

    private stateChangeHandler = this.handleStateChange.bind(this);

    private charactersLocations: Record<string, [number, number][]> = {};

    private notYetRevealedCells: [number, number][] = [];
}