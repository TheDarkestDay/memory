import { randomUUID, randomBytes } from 'crypto';
import { GameManager, Game, shuffleArray, createGameMachine, GameContext, GameFormValues, GameEvent, GameEventsMap, GameEventsPayloadMap, Player, GameData, GamePhase, GameMachine, GameTheme } from '@memory/shared';
import { AnyEventObject, interpret, State } from 'xstate';
import { uniqueNamesGenerator, adjectives, animals } from 'unique-names-generator';

const emojis = [
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

const getNumberCharacters = (count: number) => {
  return Array.from({length: count})
    .map((_, index) => {
      const numericValue = index + 1;

      return numericValue.toString();
    });
};

const getCharactersForField = (fieldSize: number, theme: GameTheme) => {
  const requiredCharactersCount = fieldSize * fieldSize / 2;
  
  if (theme === 'numbers') {
    return getNumberCharacters(requiredCharactersCount);
  }

  return emojis.slice(0, requiredCharactersCount);
};

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
    const service = interpret(machine).onTransition((state) => {
      this.emit(gameId, 'gameStateChange', this.buildGameDataFromState(state));
    });

    service.start();

    targetGame.service = service;
  }

  restartGame(gameId: string): void {
    const targetGame = this.games.find(game => game.id === gameId);

    if (targetGame == null) {
      throw new Error(`Failed to start game with id ${gameId} because it does not exist`);
    }

    if (targetGame.service == null) {
      throw new Error(`Failed to restart game with id ${gameId} because it has not been created`);
    }

    const { service, theme } = targetGame;
    
    const snapshot = service.getSnapshot();
    const { field } = snapshot.context;
    const newField = this.setUpGameField(field.length, theme);

    service.send({type: 'RESTART', field: newField});
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

    const newPlayer = {
      id: randomBytes(8).toString('hex'),
      name: playerName
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
    };
  }

  private emit(gameId: string, event: GameEvent, payload: GameEventsPayloadMap[typeof event]): void {
    const gameListeners = this.eventListeners[gameId];
    if (!gameListeners) {
      return;
    }

    const targetEventListeners = gameListeners[event];

    targetEventListeners.forEach((listener) => listener(payload as any));
  }

  private setUpGameField(fieldSize: number, theme: GameTheme): string[][] {
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

    const charactersForField = getCharactersForField(fieldSize, theme);

    for (const character of charactersForField) {
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

    return gameField;
  }

  private setUpGameMachine({fieldSize, players, theme}: Game) {
    return createGameMachine({
      players: players.map((player) => player.name),
      field: this.setUpGameField(fieldSize, theme),
    });
  }
};

export const inMemoryGameManager = new InMemoryGameManager();