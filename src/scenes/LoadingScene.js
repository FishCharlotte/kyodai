import { SCENES, GAME_CONFIG } from '../constants/gameConstants.js';

export default class LoadingScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.LOADING });
    }

    preload() {
        this.createLoadingBar();

        // 加载资源
        this.load.image('block', './assets/block/block.png');
        this.load.image('select', './assets/block/select.png');

        for (let i = 1; i <= GAME_CONFIG.TILE_TYPES; i++) {
            this.load.image(`tile${i}`, `./assets/block/icon/${i}.png`);
        }
    }

    create() {
        this.scene.start(SCENES.MENU);
    }

    /**
     * 创建加载进度条
     */
    createLoadingBar() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width/4, height/2 - 30, width/2, 50);
        
        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width/4 + 10, height/2 - 20, (width/2 - 20) * value, 30);
        });
    }
} 
