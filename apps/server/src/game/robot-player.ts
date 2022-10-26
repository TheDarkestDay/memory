import { GameService } from "@memory/shared";

const ACTIONS_DELAY = 750;

export class RobotPlayer {


    constructor(private name: string, private gameService: GameService) {
    }

    startPlaying() {
        this.gameService.onChange((context) => {
            const { currentPlayer, revealedCells } = context;
        });
    }
}