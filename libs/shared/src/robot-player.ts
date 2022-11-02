import { RevealNextCellEvent } from "./game-machine";

export type ActionListener = (event: RevealNextCellEvent) => void;

export interface RobotPlayer {
    reset(): void;
    startPlaying(): void;
    addActionListener(listener: ActionListener): void;
};