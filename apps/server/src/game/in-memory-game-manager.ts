import { randomUUID } from 'crypto';
import { GameManager, Game, GameConfig } from '@memory/shared';

export class InMemoryGameManager implements GameManager {
  private games: Game[] = [];

  async createNewGame(): Promise<Game> {
    const game: Game = {
      id: randomUUID(),
    };

    this.games.push(game);

    return game;
  }
};

export const inMemoryGameManager = new InMemoryGameManager();