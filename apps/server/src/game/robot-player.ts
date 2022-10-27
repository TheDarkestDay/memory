import { GameContext, GameService } from "@memory/shared";
import { State, AnyEventObject } from "xstate";

const ACTIONS_DELAY = 750;

export class RobotPlayer {


    constructor(private name: string, private gameService: GameService) {
    }

    startPlaying() {
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
            // TODO
        } else {
           // TODO
        }
    }

    private stateChangeHandler = this.handleStateChange.bind(this);
}