import { SCENES } from '../constants/gameConstants.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.BOOT });
    }

    create() {
        this.scene.start(SCENES.LOADING);
    }
} 