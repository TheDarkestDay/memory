import { InterpreterFrom } from 'xstate';

import { GameContext, GameMachine } from './game-machine';

export type GameTheme = 'numbers' | 'emojis';

export type GameFormValues = {
  fieldSize: number;
  playersCount: number;
  theme: GameTheme;
};

export type GameEvent = 'gameStateChange' | 'playersListChange';

export type GameEventsPayloadMap = {
  gameStateChange: GameContext;
  playersListChange: string[];
};

export type GameEventsMap = {
  'gameStateChange': (context: GameContext) => void;
  'playersListChange': (players: string[]) => void;
};

export interface GameManager {
  createNewGame(config: GameFormValues): Promise<Game>;
  startGame(gameId: string): void;
  addPlayer(gameId: string): Player;
  removePlayer(gameId: string, playerName: string): void;
  getPlayersList(gameId: string): string[];
  getGameContext(gameId: string): GameContext;
  isGameStarted(gameId: string): boolean;
  revealCell(gameId: string, row: number, col: number, playerName: string): void;
  on(gameId: string, event: GameEvent, listener: GameEventsMap[GameEvent]): void;
  off(gameId: string, event: GameEvent, listener: GameEventsMap[GameEvent]): void;
}

export type Player = {
  name: string
};

export type Game = {
  id: string;
  service: InterpreterFrom<GameMachine>;
  players: string[];
  fieldSize: number;
  theme: GameTheme;
};