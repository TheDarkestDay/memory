import { createGameMachine } from "@memory/shared";
import { interpret } from "xstate";

import { InfiniteMemoryRobot } from './infinite-memory-robot';

jest.mock('@memory/shared', () => {
    const originalModule = jest.requireActual("@memory/shared");

    return {
        __esModule: true,
        ...originalModule,
        getRandomNumber: () => {
            return 0;
        }
    };
});

const CHECK_SCORE_DELAY = 0;

describe('InfiniteMemoryRobot', () => {
    it('should reveal new cells if no matches have been discovered', (done) => {
        const machine = createGameMachine({
            field: [
                ['1', '2'],
                ['3', '4']
            ],
            players: [
                'Joe',
                'Robo-Joe'
            ]
        }, { checkScoreDelay: CHECK_SCORE_DELAY });
        const service = interpret(machine);

        const actionsListener = jest.fn().mockImplementation((event) => {
            service.send({ type: 'REVEAL_NEXT_CELL', ...event });
        });

        const roboJoe = new InfiniteMemoryRobot('Robo-Joe', service);

        roboJoe.addActionListener(actionsListener);

        let turnsPassed = -1;
        service.onTransition((state) => {
            const { value } = state;

            if (value === 'noCellsRevealed') {
                turnsPassed += 1;

                if (turnsPassed === 2) {
                    const robotActions = actionsListener.mock.calls.map(([action]) => action);

                    const didRobotRevealBottomLeftCorner = robotActions.some((action) => action.row === 1 && action.col === 0);
                    const didRobotRevealBottomRightCorner = robotActions.some((action) => action.row === 1 && action.col === 1);

                    expect(didRobotRevealBottomLeftCorner).toBe(true);
                    expect(didRobotRevealBottomRightCorner).toBe(true);

                    done();
                }
            }
        });

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
    });

    it('should reveal a match immediately after discovery', (done) => {
        const machine = createGameMachine({
            field: [
                ['1', '2'],
                ['3', '1']
            ],
            players: [
                'Joe',
                'Robo-Joe'
            ]
        }, { checkScoreDelay: CHECK_SCORE_DELAY });
        const service = interpret(machine);

        const roboJoe = new InfiniteMemoryRobot('Robo-Joe', service);

        const actionsListener = jest.fn().mockImplementation((event) => {
            service.send({ type: 'REVEAL_NEXT_CELL', ...event });
        });

        roboJoe.addActionListener(actionsListener);

        let turnsPassed = -1;
        service.onTransition((state) => {
            const { value } = state;

            if (value === 'noCellsRevealed') {
                turnsPassed += 1;

                if (turnsPassed === 2) {
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
                }

                if (turnsPassed === 4) {
                    const robotActions = actionsListener.mock.calls.map(([action]) => action);

                    const didRobotRevealTopLeftCorner = robotActions.some((action) => action.row === 0 && action.col === 0);
                    const didRobotRevealBottomRightCorner = robotActions.some((action) => action.row === 1 && action.col === 1);

                    expect(didRobotRevealTopLeftCorner).toBe(true);
                    expect(didRobotRevealBottomRightCorner).toBe(true);

                    done();
                }
            }
        });

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
    });

    it('should not try to reveal a match just discovered by its own', (done) => {
        const machine = createGameMachine({
            field: [
                ['1', '2', '2'],
                ['2', '3', '5'],
                ['3', '5', '4']
            ],
            players: [
                'Joe',
                'Robo-Joe'
            ]
        }, { checkScoreDelay: CHECK_SCORE_DELAY });
        const service = interpret(machine);

        const roboJoe = new InfiniteMemoryRobot('Robo-Joe', service);

        const actionsListener = jest.fn().mockImplementation((event) => {
            service.send({ type: 'REVEAL_NEXT_CELL', ...event });
        });

        roboJoe.addActionListener(actionsListener);

        let turnsPassed = -1;
        service.onTransition((state) => {
            const { value } = state;

            if (value === 'noCellsRevealed') {
                turnsPassed += 1;

                if (turnsPassed === 2) {
                    service.send({
                        type: 'REVEAL_NEXT_CELL',
                        row: 0,
                        col: 0,
                        playerName: 'Joe'
                    });
                    service.send({
                        type: 'REVEAL_NEXT_CELL',
                        row: 1,
                        col: 1,
                        playerName: 'Joe'
                    });
                }

                if (turnsPassed === 4) {
                    const robotActions = actionsListener.mock.calls.map(([action]) => action);

                    const didRobotRevealCenterLeftCorner = robotActions.some((action) => action.row === 1 && action.col === 0);
                    const didRobotRevealCenterRightCorner = robotActions.some((action) => action.row === 1 && action.col === 2);

                    expect(didRobotRevealCenterLeftCorner).toBe(true);
                    expect(didRobotRevealCenterRightCorner).toBe(true);

                    done();
                }
            }
        });

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
            row: 1,
            col: 1,
            playerName: 'Joe'
        });
    });

    it('should not try to reveal the match just discovered by its opponent', (done) => {
        const machine = createGameMachine({
            field: [
                ['2', '3'],
                ['1', '2']
            ],
            players: [
                'Joe',
                'Robo-Joe'
            ]
        }, { checkScoreDelay: CHECK_SCORE_DELAY });
        const service = interpret(machine);

        const roboJoe = new InfiniteMemoryRobot('Robo-Joe', service);

        const actionsListener = jest.fn().mockImplementation((event) => {
            service.send({ type: 'REVEAL_NEXT_CELL', ...event });
        });

        roboJoe.addActionListener(actionsListener);

        let turnsPassed = -1;
        service.onTransition((state) => {
            const { value } = state;
            if (value === 'noCellsRevealed') {
                turnsPassed += 1;
            }

            if (turnsPassed === 2) {
                const robotActions = actionsListener.mock.calls.map(([action]) => action);

                const didRobotRevealTopRightCorner = robotActions.some((action) => action.row === 0 && action.col === 1);
                const didRobotRevealBottomLeftCorner = robotActions.some((action) => action.row === 1 && action.col === 0);

                expect(didRobotRevealTopRightCorner).toBe(true);
                expect(didRobotRevealBottomLeftCorner).toBe(true);

                done();
            }
        });

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
            row: 1,
            col: 1,
            playerName: 'Joe'
        });
    });

    it('should be able to make the first turn', (done) => {
        const machine = createGameMachine({
            field: [
                ['1', '2'],
                ['2', '3']
            ],
            players: [
                'Robo-Joe',
                'Joe'
            ]
        }, { checkScoreDelay: CHECK_SCORE_DELAY });
        const service = interpret(machine);

        const roboJoe = new InfiniteMemoryRobot('Robo-Joe', service);

        const actionsListener = jest.fn().mockImplementation((event) => {
            service.send({ type: 'REVEAL_NEXT_CELL', ...event });
        });

        roboJoe.addActionListener(actionsListener);

        service.onTransition((state) => {
            const { value } = state;

            if (value === 'lookingForWinner') {
                const robotActions = actionsListener.mock.calls.map(([action]) => action);

                expect(robotActions.length).toEqual(2);

                done();
            }
        });

        service.start();
        roboJoe.startPlaying();
    });

    it('should be able to complete a match discovered during its own turn', (done) => {
        const machine = createGameMachine({
            field: [
                ['1', '2'],
                ['2', '3']
            ],
            players: [
                'Joe',
                'Robo-Joe'
            ]
        }, { checkScoreDelay: CHECK_SCORE_DELAY });
        const service = interpret(machine);

        const roboJoe = new InfiniteMemoryRobot('Robo-Joe', service);

        const actionsListener = jest.fn().mockImplementation((event) => {
            service.send({ type: 'REVEAL_NEXT_CELL', ...event });
        });

        roboJoe.addActionListener(actionsListener);

        let turnsPassed = -1;
        service.onTransition((state) => {
            const { value } = state;
            if (value === 'noCellsRevealed') {
                turnsPassed += 1;
            }

            if (turnsPassed === 2) {
                const robotActions = actionsListener.mock.calls.map(([action]) => action);

                const didRobotRevealTopRightCorner = robotActions.some((action) => action.row === 0 && action.col === 1);
                const didRobotRevealBottomLeftCorner = robotActions.some((action) => action.row === 1 && action.col === 0);

                expect(didRobotRevealTopRightCorner).toBe(true);
                expect(didRobotRevealBottomLeftCorner).toBe(true);

                done();
            }
        });

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
            row: 1,
            col: 0,
            playerName: 'Joe'
        });
    });

    it('should be able to play a new game after reset', (done) => {
        const field = [
            ['1', '2'],
            ['2', '1']
        ];
        const machine = createGameMachine({
            field,
            players: [
                'Joe',
                'Robo-Joe'
            ]
        }, { checkScoreDelay: CHECK_SCORE_DELAY });
        const service = interpret(machine);

        const roboJoe = new InfiniteMemoryRobot('Robo-Joe', service);

        const actionsListener = jest.fn().mockImplementation((event) => {
            service.send({ type: 'REVEAL_NEXT_CELL', ...event });
        });

        roboJoe.addActionListener(actionsListener);

        let wasGameRestarted = false;
        service.onTransition((state) => {
            const { value, context } = state;
            const { currentPlayer } = context;

            if (wasGameRestarted && value === 'noCellsRevealed' && currentPlayer === 'Joe') {
                service.send({
                    type: 'REVEAL_NEXT_CELL',
                    row: 0,
                    col: 0,
                    playerName: 'Joe'
                });
                service.send({
                    type: 'REVEAL_NEXT_CELL',
                    row: 1,
                    col: 1,
                    playerName: 'Joe'
                });
            }

            if (value === 'finished') {
                if (wasGameRestarted) {
                    const robotActions = actionsListener.mock.calls
                        .slice(2)
                        .map(([action]) => action);

                    const didRobotRevealTopRightCorner = robotActions.some((action) => action.row === 0 && action.col === 1);
                    const didRobotRevealBottomLeftCorner = robotActions.some((action) => action.row === 1 && action.col === 0);

                    expect(didRobotRevealTopRightCorner).toBe(true);
                    expect(didRobotRevealBottomLeftCorner).toBe(true);

                    done();
                } else {
                    roboJoe.reset();
                    service.send({ type: 'RESTART', field });

                    wasGameRestarted = true;
                }
            }
        });

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
            row: 1,
            col: 1,
            playerName: 'Joe'
        });
    });

    it('should be able to complete a match discovered during its own turn even if the match is located in the same row', (done) => {
        const machine = createGameMachine({
            field: [
                ['2', '2'],
                ['1', '3']
            ],
            players: [
                'Joe',
                'Robo-Joe'
            ]
        }, { checkScoreDelay: CHECK_SCORE_DELAY });
        const service = interpret(machine);

        const roboJoe = new InfiniteMemoryRobot('Robo-Joe', service);

        const actionsListener = jest.fn().mockImplementation((event) => {
            service.send({ type: 'REVEAL_NEXT_CELL', ...event });
        });

        roboJoe.addActionListener(actionsListener);

        let turnsPassed = -1;
        service.onTransition((state) => {
            const { value } = state;
            if (value === 'noCellsRevealed') {
                turnsPassed += 1;
            }

            if (turnsPassed === 2) {
                const robotActions = actionsListener.mock.calls.map(([action]) => action);

                const didRobotRevealTopRightCorner = robotActions.some((action) => action.row === 0 && action.col === 1);
                const didRobotRevealTopLeftCorner = robotActions.some((action) => action.row === 0 && action.col === 0);

                expect(didRobotRevealTopRightCorner).toBe(true);
                expect(didRobotRevealTopLeftCorner).toBe(true);

                done();
            }
        });

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
            row: 1,
            col: 0,
            playerName: 'Joe'
        });
    });

    it('should not try to open the same matching cell multiple times during its turn', (done) => {
        const machine = createGameMachine({
            field: [
                ['2', '3', '4'],
                ['1', '5', '6'],
                ['7', '8', '2']
            ],
            players: [
                'Joe',
                'Robo-Joe'
            ]
        }, { checkScoreDelay: CHECK_SCORE_DELAY });
        const service = interpret(machine);

        const roboJoe = new InfiniteMemoryRobot('Robo-Joe', service);

        const actionsListener = jest.fn().mockImplementation((event) => {
            service.send({ type: 'REVEAL_NEXT_CELL', ...event });
        });

        roboJoe.addActionListener(actionsListener);

        let turnsPassed = -1;
        service.onTransition((state) => {
            const { value } = state;

            if (value === 'noCellsRevealed') {
                turnsPassed += 1;

                if (turnsPassed === 2) {
                    service.send({
                        type: 'REVEAL_NEXT_CELL',
                        row: 0,
                        col: 0,
                        playerName: 'Joe'
                    });
                    service.send({
                        type: 'REVEAL_NEXT_CELL',
                        row: 1,
                        col: 1,
                        playerName: 'Joe'
                    });
                }

                if (turnsPassed === 4) {
                    service.send({
                        type: 'REVEAL_NEXT_CELL',
                        row: 1,
                        col: 1,
                        playerName: 'Joe'
                    });
                    service.send({
                        type: 'REVEAL_NEXT_CELL',
                        row: 2,
                        col: 2,
                        playerName: 'Joe'
                    });
                }

                if (turnsPassed === 6) {
                    const robotActions = actionsListener.mock.calls.map(([action]) => action);

                    const topLeftCornerRevealedTimes = robotActions.filter(({ row, col }) => row === 0 && col === 0).length;
                    const bottomRightCornerRevealedTimes = robotActions.filter(({ row, col }) => row === 2 && col === 2).length;

                    expect(topLeftCornerRevealedTimes === 1).toEqual(true);
                    expect(bottomRightCornerRevealedTimes === 1).toEqual(true);

                    done();
                }
            }
        });

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
            row: 1,
            col: 1,
            playerName: 'Joe'
        });
    });

    fit('should choose to complete one full match even if more are avaiable now', (done) => {
        const machine = createGameMachine({
            field: [
                ['2', '3'],
                ['2', '3']
            ],
            players: [
                'Joe',
                'Alice',
                'Robo-Joe'
            ]
        }, { checkScoreDelay: CHECK_SCORE_DELAY });
        const service = interpret(machine);

        const roboJoe = new InfiniteMemoryRobot('Robo-Joe', service);

        const actionsListener = jest.fn().mockImplementation((event) => {
            service.send({ type: 'REVEAL_NEXT_CELL', ...event });
        });

        roboJoe.addActionListener(actionsListener);

        let turnsPassed = -1;
        service.onTransition((state) => {
            const { value } = state;

            if (value === 'noCellsRevealed') {
                turnsPassed += 1;

                if (turnsPassed === 1) {
                    service.send({
                        type: 'REVEAL_NEXT_CELL',
                        row: 0,
                        col: 1,
                        playerName: 'Alice'
                    });
                    service.send({
                        type: 'REVEAL_NEXT_CELL',
                        row: 1,
                        col: 0,
                        playerName: 'Alice'
                    });
                }

                if (turnsPassed === 3) {
                    const robotActions = actionsListener.mock.calls.map(([action]) => action);
                    const [{ row: firstRow, col: firstCol }, { row: secondRow, col: secondCol }] = robotActions;

                    const { field } = state.context;

                    const firstRevealedCharacter = field[firstRow][firstCol];
                    const secondRevealedCharacter = field[secondRow][secondCol];

                    expect(firstRevealedCharacter).toEqual(secondRevealedCharacter);

                    done();
                }
            }
        });

        service.start();
        roboJoe.startPlaying();

        service.send({
            type: 'REVEAL_NEXT_CELL',
            row: 1,
            col: 1,
            playerName: 'Joe'
        });
        service.send({
            type: 'REVEAL_NEXT_CELL',
            row: 0,
            col: 0,
            playerName: 'Joe'
        });
    });
});