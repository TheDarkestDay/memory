import { GameTheme, shuffleArray } from "@memory/shared";

export const emojis = [
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
    return Array.from({ length: count })
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

export class GameFieldFactory {
    createGameField(size: number, theme: GameTheme) {
        const gameField = [] as string[][];
        for (let j = 0; j < size; j++) {
            gameField.push([]);
        }

        const gameFieldPositions = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                gameFieldPositions.push([i, j]);
            }
        }

        const randomPositions = shuffleArray(gameFieldPositions);

        const charactersForField = getCharactersForField(size, theme);

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
};

export const gameFieldFactory = new GameFieldFactory();