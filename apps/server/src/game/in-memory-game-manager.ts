import { randomUUID, randomBytes } from 'crypto';
import { GameManager, Game, createGameMachine, GameContext, GameFormValues, GameEvent, GameEventsMap, GameEventsPayloadMap, Player, GameData, GamePhase } from '@memory/shared';
import { AnyEventObject, interpret, State } from 'xstate';
import { gameFieldFactory, GameFieldFactory } from './game-field-factory';
import { InfiniteMemoryRobot } from './infinite-memory-robot';
import { generateUniqueName, getAnimalEmoji } from './player-names';  

const ROBOT_ACTIONS_DELAY = 1_500;

export class InMemoryGameManager implements GameManager {
  private games: Game[] = [];

  private eventListeners: Record<string, Record<GameEvent, GameEventsMap[GameEvent][]>> = {};

  constructor(private gameFieldFactory: GameFieldFactory) {
  }

  async createNewGame({theme, fieldSize, playersCount}: GameFormValues): Promise<Game> {
    const game: Game = {
      id: randomUUID(),
      service: null,
      players: [],
      robots: [],
      theme,
      fieldSize,
      playersCount
    };

    this.games.push(game);

    return game;
  }

  async startGame(gameId: string) {
    const targetGame = this.games.find((game) => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to start game with id ${gameId} because it does not exist`);
    }

    if (targetGame.service !== null) {
      throw new Error(`Failed to start game with id ${gameId} because it has already been started`);
    }

    const { players, playersCount } = targetGame;
    const robotPlayers = [];
    if (players.length < playersCount) {
      const robotPlayersCount = playersCount - players.length;

      for (let i = 0; i < robotPlayersCount; i++) {
        const robotPlayerName = `${generateUniqueName()}  🤖`;
        
        robotPlayers.push({
          id: robotPlayerName,
          name: robotPlayerName,
        });
      }
    }

    targetGame.players.push(...robotPlayers);
    this.emit(gameId, 'playersListChange', targetGame.players);

    const machine = this.setUpGameMachine(targetGame);
    const service = interpret(machine).onTransition((state) => {
      this.emit(gameId, 'gameStateChange', this.buildGameDataFromState(state));
    });

    const robots = robotPlayers.map(({name}) => {
      const robot = new InfiniteMemoryRobot(name, service);

      robot.addActionListener((revealCellAction) => {
        setTimeout(() => {
          service.send({type: 'REVEAL_NEXT_CELL', ...revealCellAction});
        }, ROBOT_ACTIONS_DELAY);
      });
      robot.startPlaying();

      return robot;
    });

    service.start();

    targetGame.service = service;
    targetGame.robots = robots;
  }

  restartGame(gameId: string): void {
    const targetGame = this.games.find(game => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to start game with id ${gameId} because it does not exist`);
    }

    if (targetGame.service == null) {
      throw new Error(`Failed to restart game with id ${gameId} because it has not been created`);
    }

    const { service, theme, robots } = targetGame;

    robots.forEach((robot) => robot.reset());
    
    const snapshot = service.getSnapshot();
    const { field } = snapshot.context;
    const newField = this.gameFieldFactory.createGameField(field.length, theme);

    service.send({type: 'RESTART', field: newField});
  }

  addPlayer(gameId: string) {
    const targetGame = this.games.find(game => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to add player to game with id ${gameId} because it does not exist`);
    }

    const playerName = generateUniqueName();
    const [, animalName] = playerName.split(' ');
    const shortName = getAnimalEmoji(animalName);

    const newPlayer = {
      id: randomBytes(8).toString('hex'),
      name: playerName,
      shortName,
    };

    targetGame.players.push(newPlayer);

    this.emit(gameId, 'playersListChange', targetGame.players);

    return newPlayer;
  }

  async getPlayerById(gameId: string, id: string): Promise<Player> {
    const targetGame = this.games.find((game) => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to get player for game with id ${gameId} because it does not exist`);
    }

    const { players } = targetGame;

    const player = players.find((player) => player.id === id);

    if (player == null) {
      return null;
    }

    return player;
  }

  isPlayerJoinedGame(gameId: string, playerId: string): boolean {
    const targetGame = this.games.find((game) => game.id === gameId);

    if (targetGame == null) {
      return false;
    }

    return targetGame.players.some((player) => player.id === playerId);
  }

  removePlayer(gameId: string, playerName: string): void {
    const targetGame = this.games.find(game => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to remove player from game with id ${gameId} because it does not exist`);
    }

    const { players } = targetGame;

    const playerToRemoveIndex = players.findIndex((player) => player.name === playerName);

    if (playerToRemoveIndex !== -1) {
      players.splice(playerToRemoveIndex, 1);
    }

    this.emit(gameId, 'playersListChange', players);
  }

  getPlayersList(gameId: string): Player[] {
    const targetGame = this.games.find(game => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to get players list for game with id ${gameId} because it does not exist`);
    }

    return targetGame.players;
  }

  getGameData(gameId: string): GameData {
    const targetGame = this.games.find(game => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to get game data for game with id ${gameId} because it does not exist`);
    }

    const { service } = targetGame;

    if (service === null) {
      throw new Error(`Failed to get game data for game with id ${gameId} because it has not been started`);
    }

    const stateSnapshot = service.getSnapshot();

    return this.buildGameDataFromState(stateSnapshot);
  }

  revealCell(gameId: string, row: number, col: number, playerName: string): void {
    const targetGame = this.games.find((game) => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to reveal cell for game with id ${gameId} because it does not exist`);
    }

    const { service } = targetGame;

    if (service === null) {
      throw new Error(`Failed to reveal cell for game with id ${gameId} because it has not been started`);
    }

    service.send({
      type: 'REVEAL_NEXT_CELL',
      row,
      col,
      playerName
    });
  }

  on(gameId: string, event: GameEvent, listener: GameEventsMap[typeof event]): void {
    if (!this.eventListeners[gameId]) {
      this.eventListeners[gameId] = {
        'gameStateChange': [],
        'playersListChange': [],
      };
    }

    this.eventListeners[gameId][event].push(listener);
  }

  off(gameId: string, event: GameEvent, listener: GameEventsMap[typeof event]): void {
    const gameListeners = this.eventListeners[gameId];
    const targetEventListeners = gameListeners[event];

    const listenerToRemoveIndex = targetEventListeners.indexOf(listener);
    targetEventListeners.splice(listenerToRemoveIndex, 1);
  }

  isGameStarted(gameId: string): boolean {
    const targetGame = this.games.find(game => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to check if game with id ${gameId} has been started because it does not exist`);
    }

    return targetGame.service !== null;
  }

  private buildGameDataFromState(state: State<GameContext, AnyEventObject>): GameData {
    const { value, context } = state;

    return {
      phase: value as GamePhase,
      ...context
    }
  }

  private emit(gameId: string, event: GameEvent, payload: GameEventsPayloadMap[typeof event]): void {
    const gameListeners = this.eventListeners[gameId];
    if (!gameListeners) {
      return;
    }

    const targetEventListeners = gameListeners[event];

    targetEventListeners.forEach((listener) => listener(payload as any));
  }

  private setUpGameMachine({fieldSize, players, theme}: Game) {
    return createGameMachine({
      players: players.map((player) => player.name),
      field: this.gameFieldFactory.createGameField(fieldSize, theme),
    });
  }
};

export const inMemoryGameManager = new InMemoryGameManager(
  gameFieldFactory
);