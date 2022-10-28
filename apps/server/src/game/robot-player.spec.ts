import { createGameMachine } from "@memory/shared";
import { interpret } from "xstate";

import { RobotPlayer } from './robot-player';

jest.useFakeTimers();

describe('RobotPlayer', () => {
    fit('should reveal new cells if no matches have been discovered', () => {
        const machine = createGameMachine({
            field: [
                ['1', '2'],
                ['2', '1']
            ],
            players: [
                'Joe',
                'Robo-Joe'
            ]
        });
        const service = interpret(machine);

        const roboJoe = new RobotPlayer('Robo-Joe', service);

        service.start();

        roboJoe.startPlaying();

        service.send({
            type: 'REVEAL_NEXT_CELL',
            row: 0,
            col: 0,
            playerName: 'Joe'
        });
        service.send({
            type: 'REVEAL_NEXT_CELL',
            row: 0,
            col: 1,
            playerName: 'Joe'
        });

        jest.runAllTimers();

        const snapshot = service.getSnapshot();
        const actions = snapshot.actions;
        
        const lastJoeActionIndex = actions.findIndex((action) => action.playerName === 'Joe');
        const robotActions = actions.slice(lastJoeActionIndex + 1);

        console.log(`Recorded ${snapshot.actions.length} actions`);

        actions.forEach((action) => {
            console.log('Got action', action);
        });

        const didRobotRevealBottomLeftCorner = robotActions.some((action) => action.row === 1 && action.col === 0);
        const didRobotRevealBottomRightCorner = robotActions.some((action) => action.row === 1 && action.col === 1);

        expect(didRobotRevealBottomLeftCorner).toBe(true);
        expect(didRobotRevealBottomRightCorner).toBe(true);
    });

    it('should reveal a match immediately after discovery', () => {
        const machine = createGameMachine({
            field: [
                ['1', '2'],
                ['2', '3']
            ],
            players: [
                'Joe',
                'Robo-Joe'
            ]
        });
        const service = interpret(machine);

        service.start();

        service.send({
            type: 'REVEAL_NEXT_CELL',
            row: 0,
            col: 0,
            playerName: 'Joe'
        });
        service.send({
            type: 'REVEAL_NEXT_CELL',
            row: 0,
            col: 1,
            playerName: 'Joe'
        });

        jest.runAllTimers();

        service.send({
            type: 'REVEAL_NEXT_CELL',
            row: 0,
            col: 0,
            playerName: 'Joe'
        });
        service.send({
            type: 'REVEAL_NEXT_CELL',
            row: 0,
            col: 1,
            playerName: 'Joe'
        });

        jest.runAllTimers();

        const snapshot = service.getSnapshot();
        const actions = snapshot.actions;
        
        const lastJoeActionIndex = actions.findIndex((action) => action.playerName === 'Joe');
        const robotActions = actions.slice(lastJoeActionIndex + 1);

        const didRobotRevealTopRightCorner = robotActions.some((action) => action.row === 0 && action.col === 1);
        const didRobotRevealBottomLeftCorner = robotActions.some((action) => action.row === 1 && action.col === 0);

        expect(didRobotRevealTopRightCorner).toBe(true);
        expect(didRobotRevealBottomLeftCorner).toBe(true);
    });

    it('should not try to reveal the match just discovered by its opponent', () => {
        const machine = createGameMachine({
            field: [
                ['1', '2'],
                ['2', '3']
            ],
            players: [
                'Joe',
                'Robo-Joe'
            ]
        });
        const service = interpret(machine);

        service.start();

        service.send({
            type: 'REVEAL_NEXT_CELL',
            row: 0,
            col: 1,
            playerName: 'Joe'
        });
        service.send({
            type: 'REVEAL_NEXT_CELL',
            row: 1,
            col: 0,
            playerName: 'Joe'
        });

        jest.runAllTimers();

        const snapshot = service.getSnapshot();
        const actions = snapshot.actions;
        
        const lastJoeActionIndex = actions.findIndex((action) => action.playerName === 'Joe');
        const robotActions = actions.slice(lastJoeActionIndex + 1);

        const didRobotRevealTopLeftCorner = robotActions.some((action) => action.row === 0 && action.col === 0);
        const didRobotRevealBottomRightCorner = robotActions.some((action) => action.row === 1 && action.col === 1);

        expect(didRobotRevealTopLeftCorner).toBe(true);
        expect(didRobotRevealBottomRightCorner).toBe(true);
    });
});