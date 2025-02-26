import { SCENES, GAME_CONFIG } from '../constants/gameConstants.js';
import { DIFFICULTY, LEVELS } from '../constants/levelConfigs.js';

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.MENU });
    }

    create() {
        this.cameras.main.setBackgroundColor(GAME_CONFIG.BACKGROUND_COLOR);
        
        // 标题
        this.add.text(400, 100, GAME_CONFIG.GAME_TITLE, {
            fontSize: '64px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // 创建难度选择按钮
        const difficulties = [
            { text: '简单', value: DIFFICULTY.EASY },
            { text: '中等', value: DIFFICULTY.MEDIUM },
            { text: '困难', value: DIFFICULTY.HARD }
        ];

        difficulties.forEach((diff, index) => {
            const button = this.add.text(400, 250 + index * 80, diff.text, {
                fontSize: '32px',
                fill: '#fff',
                backgroundColor: '#4a90e2',
                padding: { x: 30, y: 15 },
                stroke: '#000',
                strokeThickness: 4
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                // 鼠标悬停效果
                button.setStyle({ fill: '#ff0', backgroundColor: '#5aa0f2' });
                button.setScale(1.1);
            })
            .on('pointerout', () => {
                // 鼠标离开效果
                button.setStyle({ fill: '#fff', backgroundColor: '#4a90e2' });
                button.setScale(1);
            })
            .on('pointerdown', () => this.startGame(diff.value, 1));
        });
    }

    startGame(difficulty, levelId) {
        this.scene.start(SCENES.GAME, { 
            difficulty, 
            levelId,
            levelConfig: LEVELS[difficulty].find(l => l.id === levelId)
        });
    }
} 