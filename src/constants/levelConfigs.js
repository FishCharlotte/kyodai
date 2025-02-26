export const DIFFICULTY = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
};

export const LEVELS = {
    [DIFFICULTY.EASY]: [
        {
            id: 1,
            gridWidth: 6,
            gridHeight: 6,
            tileCounts: {
                0: 4,
                1: 4,
                2: 4,
                3: 4,
                4: 4
            },
            defaultPairCount: 2
        },
        {
            id: 2,
            gridWidth: 8,
            gridHeight: 6,
            tileCounts: {
                0: 6,
                1: 6,
                2: 6,
                3: 6
            },
            defaultPairCount: 2
        }
    ],
    [DIFFICULTY.MEDIUM]: [
        {
            id: 1,
            gridWidth: 8,
            gridHeight: 8,
            tileCounts: {
                0: 8,
                1: 8,
                2: 8,
                3: 8,
                4: 8,
                5: 8
            },
            defaultPairCount: 2
        },
        {
            id: 2,
            gridWidth: 10,
            gridHeight: 8,
            tileCounts: {
                0: 10,
                1: 10,
                2: 10,
                3: 10
            },
            defaultPairCount: 2
        }
    ],
    [DIFFICULTY.HARD]: [
        {
            id: 1,
            gridWidth: 10,
            gridHeight: 10,
            tileCounts: {
                0: 10,
                1: 10,
                2: 10,
                3: 10,
                4: 10,
                5: 10,
                6: 10,
                7: 10,
                8: 10,
                9: 10
            },
            defaultPairCount: 2
        },
        {
            id: 2,
            gridWidth: 12,
            gridHeight: 10,
            tileCounts: {
                0: 12,
                1: 12,
                2: 12,
                3: 12,
                4: 12,
                5: 12,
                6: 12,
                7: 12
            },
            defaultPairCount: 2
        }
    ]
}; 