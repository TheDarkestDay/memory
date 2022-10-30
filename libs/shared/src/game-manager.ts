import { GameData, GameService } from './game-machine';

export type GameTheme = 'numbers' | 'emojis';

export type GameFormValues = {
  fieldSize: number;
  playersCount: number;
  theme: GameTheme;
};

export type GameEvent = 'gameStateChange' | 'playersListChange';

export type GameEventsPayloadMap = {
  gameStateChange: GameData;
  playersListChange: Player[];
};

export type GameEventsMap = {
  'gameStateChange': (context: GameData) => void;
  'playersListChange': (players: Player[]) => void;
};

export interface GameManager {
  getPlayerById(gameId: string, id: string): Promise<Player | null>;
  createNewGame(config: GameFormValues): Promise<Game>;
  startGame(gameId: string): void;
  restartGame(gameId: string): void;
  addPlayer(gameId: string): Player;
  removePlayer(gameId: string, playerName: string): void;
  getPlayersList(gameId: string): Player[];
  getGameData(gameId: string): GameData;
  isGameStarted(gameId: string): boolean;
  isPlayerJoinedGame(gameId: string, playerId: string): boolean;
  revealCell(gameId: string, row: number, col: number, playerName: string): void;
  on(gameId: string, event: GameEvent, listener: GameEventsMap[GameEvent]): void;
  off(gameId: string, event: GameEvent, listener: GameEventsMap[GameEvent]): void;
}

export type Player = {
  id: string;
  name: string;
};

export type Game = GameFormValues & {
  id: string;
  service: GameService;
  players: Player[];
};