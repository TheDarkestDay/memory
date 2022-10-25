import { emojis, GameFieldFactory } from './game-field-factory';
 
describe('GameFieldFactory', () => {
    let gameFieldFactory: GameFieldFactory;

    beforeEach(() => {
        gameFieldFactory = new GameFieldFactory();
    });

    it('should create a field of a size equal to Math.pow(size, 2)', () => {
        const size = 4;
        const field = gameFieldFactory.createGameField(size, 'numbers');

        let cellsCount = 0;
        for (let i = 0; i < field.length; i++) {
            const row = field[i];
            for (let j = 0; j < row.length; j++) {
                cellsCount += 1;
            }
        }

        expect(cellsCount).toEqual(size * size);
    });

    it('should create a field filled with numbers', () => {
        const size = 4;
        const field = gameFieldFactory.createGameField(size, 'numbers');

        let numericCellsCount = 0;
        for (let i = 0; i < field.length; i++) {
            const row = field[i];
            for (let j = 0; j < row.length; j++) {
                const currentCell = row[j];
                const cellAsInt = parseInt(currentCell);

                if (!Number.isNaN(cellAsInt)) {
                    numericCellsCount += 1;
                }
            }
        }

        expect(numericCellsCount).toEqual(size * size);
    });

    it('should create a field filled with emojis', () => {
        const size = 6;
        const field = gameFieldFactory.createGameField(size, 'emojis');

        let emojiCellsCount = 0;
        for (let i = 0; i < field.length; i++) {
            const row = field[i];
            for (let j = 0; j < row.length; j++) {
                const currentCell = row[j];

                if (emojis.includes(currentCell)) {
                    emojiCellsCount += 1;
                }
            }
        }

        expect(emojiCellsCount).toEqual(size * size);
    });
});