import { randomUUID, randomBytes } from 'crypto';
import { GameManager, Game, createGameMachine, GameContext, GameFormValues, GameEvent, GameEventsMap, GameEventsPayloadMap, Player, GameData, GamePhase } from '@memory/shared';
import { AnyEventObject, interpret, State } from 'xstate';
import { gameFieldFactory, GameFieldFactory } from './game-field-factory';
import { InfiniteMemoryRobot } from './infinite-memory-robot';
import { generateUniqueName, getAnimalEmoji } from './player-names';  

const NORMAL_ROBOT_ACTIONS_DELAY = 1_500;
const RELAXING_ROBOT_ACTIONS_DELAY = 3_000;

const NORMAL_CHECK_SCORE_DELAY = 1_500;
const RELAXING_CHECK_SCORE_DELAY = 3_000;

export class InMemoryGameManager implements GameManager {
  private games: Game[] = [];

  private eventListeners: Record<string, Record<GameEvent, GameEventsMap[GameEvent][]>> = {};

  constructor(private gameFieldFactory: GameFieldFactory) {
  }

  async createNewGame({theme, fieldSize, playersCount, speed}: GameFormValues): Promise<Game> {
    const game: Game = {
      id: randomUUID(),
      service: null,
      players: [],
      connectedPlayerIds: [],
      robots: [],
      theme,
      fieldSize,
      playersCount,
      speed
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
      return;
    }

    const { players, playersCount } = targetGame;
    const robotPlayers: Player[] = [];
    if (players.length < playersCount) {
      const robotPlayersCount = playersCount - players.length;

      for (let i = 0; i < robotPlayersCount; i++) {
        const name = generateUniqueName();
        const [, animal] = name.split(' ');
        const shortName = getAnimalEmoji(animal);
        
        robotPlayers.push({
          id: name,
          name,
          shortName,
          isRobot: true, 
        });

        targetGame.connectedPlayerIds.push(name);
      }
    }

    targetGame.players.push(...robotPlayers);

    if (robotPlayers.length !== 0) {
      this.notifyConnectedPlayersChange(targetGame);
    }

    const machine = this.setUpGameMachine(targetGame);
    const service = interpret(machine).onTransition((state) => {
      this.emit(gameId, 'gameStateChange', this.buildGameDataFromState(state));
    });

    const { speed } = targetGame;
    const robotActionsDelay = speed === 'normal' ? NORMAL_ROBOT_ACTIONS_DELAY : RELAXING_ROBOT_ACTIONS_DELAY;

    const robots = robotPlayers.map(({name}) => {
      const robot = new InfiniteMemoryRobot(name, service);

      robot.addActionListener((revealCellAction) => {
        setTimeout(() => {
          service.send({type: 'REVEAL_NEXT_CELL', ...revealCellAction});
        }, robotActionsDelay);
      });
      robot.startPlaying();

      return robot;
    });

    service.start();

    targetGame.service = service;
    targetGame.robots = robots;
  }

  getGameConfig(gameId: string): GameFormValues {
    const targetGame = this.games.find((game) => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to start game with id ${gameId} because it does not exist`);
    }

    const { playersCount, theme, fieldSize, speed } = targetGame;

    return {
      playersCount,
      theme,
      fieldSize,
      speed
    };
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
      isRobot: false,
    };

    targetGame.players.push(newPlayer);

    return newPlayer;
  }

  connectPlayer(gameId: string, playerId: string): void {
    const targetGame = this.games.find(game => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to add player to game with id ${gameId} because it does not exist`);
    }

    const { players, connectedPlayerIds } = targetGame;

    if (players.every((player) => player.id !== playerId)) {
      throw new Error(`Failed to connect player with id ${playerId} to game ${gameId}: This player has not yet joined the game`);
    }

    connectedPlayerIds.push(playerId);

    this.notifyConnectedPlayersChange(targetGame);
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

  disconnectPlayer(gameId: string, playerId: string): void {
    const targetGame = this.games.find(game => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to remove player from game with id ${gameId} because it does not exist`);
    }

    const { connectedPlayerIds } = targetGame;

    const playerIdToRemoveIndex = connectedPlayerIds.findIndex((id) => id === playerId);

    if (playerIdToRemoveIndex !== -1) {
      connectedPlayerIds.splice(playerIdToRemoveIndex, 1);
    }

    this.notifyConnectedPlayersChange(targetGame);
  }

  getConnectedPlayersList(gameId: string): Player[] {
    const targetGame = this.games.find(game => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to get players list for game with id ${gameId} because it does not exist`);
    }

    return this.getConnectedPlayersData(targetGame);
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

  private notifyConnectedPlayersChange(game: Game) {
    const { id } = game;

    this.emit(id, 'playersListChange', this.getConnectedPlayersData(game));
  }

  private getConnectedPlayersData(game: Game) {
    const { players, connectedPlayerIds } = game;

    return connectedPlayerIds.map((playerId) => players.find((player) => player.id === playerId));
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

  private setUpGameMachine(game: Game) {
    const {fieldSize, theme, speed} = game;
    const checkScoreDelay = speed === 'normal' ? NORMAL_CHECK_SCORE_DELAY : RELAXING_CHECK_SCORE_DELAY;

    const connectedPlayers = this.getConnectedPlayersData(game);

    return createGameMachine({
      players: connectedPlayers.map((player) => player.name),
      field: this.gameFieldFactory.createGameField(fieldSize, theme),
    }, { checkScoreDelay });
  }
};

export const inMemoryGameManager = new InMemoryGameManager(
  gameFieldFactory
);