import Phaser from 'phaser';
import gameConfig from '@/config/gameConfig.js';
import BootScene from '@/scenes/BootScene.js';
import LoadingScene from '@/scenes/LoadingScene.js';
import GameScene from '@/scenes/GameScene.js';
import MenuScene from '@/scenes/MenuScene.js';

class Game extends Phaser.Game {
    constructor() {
        super({
            ...gameConfig,
            scene: [BootScene, LoadingScene, MenuScene, GameScene]
        });
    }
}

window.onload = () => {
    new Game();
};
