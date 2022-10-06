import { randomUUID } from 'crypto';
import { GameManager, Game, shuffleArray, createGameMachine, GameContext, GameFormValues, GameEvent, GameEventsMap, GameEventsPayloadMap } from '@memory/shared';
import { interpret } from 'xstate';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

const characters = [
  '❤️', 
  '😊', 
  '✨', 
  '🔥', 
  '😂', 
  '👍', 
  '✅', 
  '✔️', 
  '😭', 
  '🥰', 
  '😍', 
  '🥺',
  '🤍',
  '👀',
  '🎉',
  '🥲',
  '😉',
  '👉',
  '⭐',
  '❤️‍🔥',
  '🤔',
  '🤩',
  '🤣',
  '🤗'
];

export class InMemoryGameManager implements GameManager {
  private games: Game[] = [];

  private eventListeners: Record<string, Record<GameEvent, GameEventsMap[GameEvent][]>> = {};

  async createNewGame({theme, fieldSize}: GameFormValues): Promise<Game> {
    const game: Game = {
      id: randomUUID(),
      service: null,
      players: [],
      theme,
      fieldSize
    };

    this.games.push(game);

    return game;
  }

  async startGame(gameId: string) {
    const targetGame = this.games.find(game => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to start game with id ${gameId} because it does not exist`);
    }

    if (targetGame.service !== null) {
      throw new Error(`Failed to start game with id ${gameId} because it has already been started`);
    }

    const machine = this.setUpGameMachine(targetGame);
    const service = interpret(machine).onChange((context) => {
      this.emit(gameId, 'gameStateChange', context);
    });

    service.start();

    targetGame.service = service;
  }

  addPlayer(gameId: string) {
    const targetGame = this.games.find(game => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to add player to game with id ${gameId} because it does not exist`);
    }

    const playerName = uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      separator: ' ',
    });

    targetGame.players.push(playerName);

    this.emit(gameId, 'playersListChange', targetGame.players);

    return {
      name: playerName
    };
  }

  removePlayer(gameId: string, playerName: string): void {
    const targetGame = this.games.find(game => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to remove player from game with id ${gameId} because it does not exist`);
    }

    const { players } = targetGame;

    const playerToRemoveIndex = players.indexOf(playerName);

    if (playerToRemoveIndex !== -1) {
      players.splice(playerToRemoveIndex, 1);
    }

    this.emit(gameId, 'playersListChange', players);
  }

  getPlayersList(gameId: string): string[] {
    const targetGame = this.games.find(game => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to get players list for game with id ${gameId} because it does not exist`);
    }

    return targetGame.players;
  }

  getGameContext(gameId: string): GameContext {
    const targetGame = this.games.find(game => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to get game context for game with id ${gameId} because it does not exist`);
    }

    const { service } = targetGame;

    if (service === null) {
      throw new Error(`Failed to get game context for game with id ${gameId} because it has not been started`);
    }

    return service.getSnapshot().context;
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

  private emit(gameId: string, event: GameEvent, payload: GameEventsPayloadMap[typeof event]): void {
    const gameListeners = this.eventListeners[gameId];
    if (!gameListeners) {
      return;
    }

    const targetEventListeners = gameListeners[event];

    targetEventListeners.forEach((listener) => listener(payload as any));
  }

  private setUpGameMachine({fieldSize, players}: Game) {
    const gameField = [] as string[][];
    for (let j = 0; j < fieldSize; j++) {
      gameField.push([]);
    }

    const gameFieldPositions = [];
    for (let i = 0; i < fieldSize; i++) {
      for (let j = 0; j < fieldSize; j++) {
        gameFieldPositions.push([i, j]);
      }
    }

    const randomPositions = shuffleArray(gameFieldPositions);

    const requiredCharacters = fieldSize * fieldSize / 2;

    for (let i = 0; i < requiredCharacters; i++) {
      const character = characters[i];

      const firstPosition = randomPositions.pop();
      const secondPosition = randomPositions.pop();

      if (!firstPosition || !secondPosition) {
        throw new Error('Field is not big enough for number of characters requested');
      }

      const [x1, y1] = firstPosition;
      const [x2, y2] = secondPosition;

      gameField[x1][y1] = character;
      gameField[x2][y2] = character;
    }

    return createGameMachine({
      players,
      field: gameField,
    });
  }
};

export const inMemoryGameManager = new InMemoryGameManager();