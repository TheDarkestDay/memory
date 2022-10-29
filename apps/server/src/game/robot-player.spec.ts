import { createGameMachine } from "@memory/shared";
import { interpret } from "xstate";

import { RobotPlayer } from './robot-player';

jest.useFakeTimers();

describe('RobotPlayer', () => {
    beforeEach(() => {
        jest.runOnlyPendingTimers();
    });

    it('should reveal new cells if no matches have been discovered', () => {
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

        const actionsListener = jest.fn().mockImplementation((event) => {
           service.send({type: 'REVEAL_NEXT_CELL', ...event});
           jest.runOnlyPendingTimers(); 
        });

        const roboJoe = new RobotPlayer('Robo-Joe', service);

        roboJoe.addActionListener(actionsListener);

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
        jest.runOnlyPendingTimers();

        const robotActions = actionsListener.mock.calls.map(([action]) => action);

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

        const roboJoe = new RobotPlayer('Robo-Joe', service);

        const actionsListener = jest.fn().mockImplementation((event) => {
            service.send({type: 'REVEAL_NEXT_CELL', ...event});
            jest.runOnlyPendingTimers(); 
        });

        roboJoe.addActionListener(actionsListener);

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
        jest.runOnlyPendingTimers();

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
        jest.runOnlyPendingTimers();

        const robotActions = actionsListener.mock.calls.map(([action]) => action);

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

        const roboJoe = new RobotPlayer('Robo-Joe', service);

        const actionsListener = jest.fn().mockImplementation((event) => {
            console.log('Robot revealing cell: ', event);
            service.send({type: 'REVEAL_NEXT_CELL', ...event});
            jest.runOnlyPendingTimers(); 
        });

        roboJoe.addActionListener(actionsListener);

        service.start();
        roboJoe.startPlaying();

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
        jest.runOnlyPendingTimers();

        const robotActions = actionsListener.mock.calls.map(([action]) => action);

        const didRobotRevealTopLeftCorner = robotActions.some((action) => action.row === 0 && action.col === 0);
        const didRobotRevealBottomRightCorner = robotActions.some((action) => action.row === 1 && action.col === 1);

        expect(didRobotRevealTopLeftCorner).toBe(true);
        expect(didRobotRevealBottomRightCorner).toBe(true);
    });

    it('should be able to make the first turn', () => {
        const machine = createGameMachine({
            field: [
                ['1', '2'],
                ['2', '3']
            ],
            players: [
                'Robo-Joe',
                'Joe'
            ]
        });
        const service = interpret(machine);

        const roboJoe = new RobotPlayer('Robo-Joe', service);

        const actionsListener = jest.fn().mockImplementation((event) => {
            service.send({type: 'REVEAL_NEXT_CELL', ...event});
            jest.runOnlyPendingTimers(); 
        });

        roboJoe.addActionListener(actionsListener);

        service.start();
        roboJoe.startPlaying();

        const robotActions = actionsListener.mock.calls.map(([action]) => action);

        expect(robotActions.length).toEqual(2);
    });
});