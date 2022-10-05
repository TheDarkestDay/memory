export type GameConfig = {
  fieldSize: number;
  numberOfPlayers: number;
  theme: 'numbers' | 'emojis';
};

export interface GameManager {
  createNewGame(config: GameConfig): Promise<Game>;
}

export type Game = {
  id: string;
};