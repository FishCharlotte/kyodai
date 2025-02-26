import { GAME_CONFIG } from '../constants/gameConstants.js';

export default class Tile extends Phaser.GameObjects.Container {
    constructor(scene, x, y, value) {
        super(scene, x, y);
        
        // 创建底部方块
        this.blockSprite = scene.add.sprite(0, 0, 'block');
        this.blockSprite.setScale(GAME_CONFIG.TILE_SCALE);
        
        // 创建图标
        this.iconSprite = scene.add.sprite(2, -2, `tile${value + 1}`);
        this.iconSprite.setScale(GAME_CONFIG.TILE_SCALE);
        
        // 创建选中效果
        this.selectSprite = scene.add.sprite(2, -2, 'select');
        this.selectSprite.setScale(GAME_CONFIG.TILE_SCALE);
        this.selectSprite.setVisible(false);
        
        // 将精灵添加到容器中（从下到上的顺序）
        this.add([this.blockSprite, this.iconSprite, this.selectSprite]);
        
        this.gridX = 0;
        this.gridY = 0;
        this.value = value;
        this.selected = false;
        
        // 设置容器的交互区域
        this.setSize(
            GAME_CONFIG.TILE_WIDTH * GAME_CONFIG.TILE_SCALE,
            GAME_CONFIG.TILE_HEIGHT * GAME_CONFIG.TILE_SCALE
        );
        this.setInteractive();
        
        this.on('pointerdown', this.onTileClick.bind(this));
        this.on('pointerover', () => {
            if (!this.selected && this.visible) {
                this.iconSprite.setTint(0xdddddd);
            }
        });
        this.on('pointerout', () => {
            if (!this.selected && this.visible) {
                this.iconSprite.clearTint();
            }
        });
    }

    onTileClick() {
        if (this.visible) {
            this.scene.handleTileClick(this);
        }
    }

    setGridPosition(x, y) {
        this.gridX = x;
        this.gridY = y;
    }

    setSelected(selected) {
        this.selected = selected;
        // 显示或隐藏选中效果
        this.selectSprite.setVisible(selected);
        
        if (this.visible) {
            if (selected) {
                this.iconSprite.setTint(0x00ff00);
            } else {
                this.iconSprite.clearTint();
            }
        }
    }

    // 重写 setVisible 方法以同时控制所有子精灵
    setVisible(value) {
        super.setVisible(value);
        this.blockSprite.setVisible(value);
        this.iconSprite.setVisible(value);
        // 选中效果的可见性取决于 selected 状态
        if (value) {
            this.selectSprite.setVisible(this.selected);
        } else {
            this.selectSprite.setVisible(false);
        }
        return this;
    }
} 