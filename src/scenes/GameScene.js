import { SCENES, GAME_CONFIG } from '../constants/gameConstants.js';
import Tile from '../objects/Tile.js';
import PathFinder from '../utils/PathFinder.js';
import { DIFFICULTY, LEVELS } from '../constants/levelConfigs.js';

export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: SCENES.GAME });
        this.tiles = [];
        this.tileSprites = [];
        this.selectedTile = null;
        this.pathFinder = null;
        this.currentLevel = null;
        this.difficulty = null;
        this.remainingTiles = 0;
    }

    init(data) {
        if (!data || !data.levelConfig) {
            console.error('No level config provided');
            this.scene.start(SCENES.MENU);
            return;
        }
        this.currentLevel = data.levelId;
        this.difficulty = data.difficulty;
        this.levelConfig = data.levelConfig;
    }

    create() {
        this.cameras.main.setBackgroundColor(GAME_CONFIG.BACKGROUND_COLOR);
        
        // 添加关卡信息
        this.add.text(16, 16, `难度: ${this.getDifficultyText()} - 关卡: ${this.currentLevel}`, {
            fontSize: '24px',
            fill: '#fff'
        });

        // 添加返回按钮
        const backButton = this.add.text(750, 16, '返回', {
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: '#4a90e2',
            padding: { x: 10, y: 5 }
        })
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.scene.start(SCENES.MENU));

        this.createBoard();
        console.log(this.tiles);
        
        this.pathFinder = new PathFinder(this.tiles);
        
        // 确保开局时有解
        if (!this.checkHasSolution()) {
            this.showNoSolutionMessage();
        }
    }

    getDifficultyText() {
        const texts = {
            [DIFFICULTY.EASY]: '简单',
            [DIFFICULTY.MEDIUM]: '中等',
            [DIFFICULTY.HARD]: '困难'
        };
        return texts[this.difficulty];
    }

    createBoard() {
        const config = this.levelConfig;
        const scaledTileWidth = GAME_CONFIG.TILE_WIDTH * GAME_CONFIG.TILE_SCALE;
        const scaledTileHeight = GAME_CONFIG.TILE_HEIGHT * GAME_CONFIG.TILE_SCALE;
        
        const actualWidth = config.gridWidth + 2;
        const actualHeight = config.gridHeight + 2;
        
        const overlap = 4;
        const totalWidth = (actualWidth * scaledTileWidth) - ((actualWidth - 1) * overlap);
        const startX = (this.cameras.main.width - totalWidth) / 2;
        const startY = (this.cameras.main.height - actualHeight * scaledTileHeight) / 2;
        
        // 创建配对数组
        let values = [];
        const totalSlots = config.gridWidth * config.gridHeight; // 注意这里使用原始尺寸
        
        // 首先填入指定数量的图案
        Object.entries(config.tileCounts).forEach(([tileIndex, count]) => {
            for (let i = 0; i < count; i++) {
                values.push(parseInt(tileIndex));
            }
        });

        // 计算剩余的空位
        const remainingSlots = totalSlots - values.length;
        if (remainingSlots > 0) {
            // 获取还没有使用的图案索引
            const usedTiles = new Set(Object.keys(config.tileCounts).map(Number));
            const availableTiles = Array.from(
                { length: GAME_CONFIG.TILE_TYPES }, 
                (_, i) => i
            ).filter(i => !usedTiles.has(i));

            // 填充剩余空位
            const pairsNeeded = remainingSlots / config.defaultPairCount;
            for (let i = 0; i < pairsNeeded; i++) {
                const tileIndex = availableTiles[i % availableTiles.length];
                for (let j = 0; j < config.defaultPairCount; j++) {
                    values.push(tileIndex);
                }
            }
        }

        // 打乱数组
        values = Phaser.Utils.Array.Shuffle(values);

        // 创建瓦片（包括外圈的null）
        for (let y = 0; y < actualHeight; y++) {
            this.tiles[y] = [];
            this.tileSprites[y] = [];
            for (let x = actualWidth - 1; x >= 0; x--) {
                if (x === 0 || x === actualWidth - 1 || y === 0 || y === actualHeight - 1) {
                    this.tiles[y][x] = null;
                    this.tileSprites[y][x] = null;
                    continue;
                }
                
                const index = (y - 1) * config.gridWidth + (x - 1);
                const value = values[index];
                
                const tileX = startX + x * scaledTileWidth - (x * overlap) + scaledTileWidth / 2;
                const tileY = startY + y * scaledTileHeight + scaledTileHeight / 2;
                
                this.tiles[y][x] = value;
                
                const tile = new Tile(this, tileX, tileY, value);
                tile.setGridPosition(x, y);
                this.add.existing(tile);
                this.tileSprites[y][x] = tile;
            }
        }

        // 设置初始剩余数量
        this.remainingTiles = config.gridWidth * config.gridHeight;
    }

    handleTileClick(tile) {
        const { gridX, gridY } = tile;
        if (this.tiles[gridY][gridX] === null) return;

        if (!this.selectedTile) {
            this.selectedTile = tile;
            tile.setSelected(true);
        } else if (this.selectedTile === tile) {
            tile.setSelected(false);
            this.selectedTile = null;
        } else {
            if (this.canConnect(this.selectedTile, tile)) {
                this.matchTiles(this.selectedTile, tile);
            } else {
                this.selectedTile.setSelected(false);
                this.selectedTile = tile;
                tile.setSelected(true);
            }
        }
    }

    canConnect(tile1, tile2) {
        const value1 = this.tiles[tile1.gridY][tile1.gridX];
        const value2 = this.tiles[tile2.gridY][tile2.gridX];
        
        if (value1 !== value2) return false;
        if (tile1 === tile2) return false;
        
        const result = this.pathFinder.findPath(tile1.gridX, tile1.gridY, tile2.gridX, tile2.gridY);
        if (result.success) {
            this.showConnectingPath(result.path);
            return true;
        }
        return false;
    }

    showConnectingPath(path) {
        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x00ff00);
        
        if (path.length > 0) {
            const config = this.levelConfig;
            const scaledTileWidth = GAME_CONFIG.TILE_WIDTH * GAME_CONFIG.TILE_SCALE;
            const scaledTileHeight = GAME_CONFIG.TILE_HEIGHT * GAME_CONFIG.TILE_SCALE;
            
            const overlap = 4;
            const actualWidth = config.gridWidth + 2;
            const actualHeight = config.gridHeight + 2;
            const startX = (this.cameras.main.width - ((actualWidth * scaledTileWidth) - ((actualWidth - 1) * overlap))) / 2;
            const startY = (this.cameras.main.height - actualHeight * scaledTileHeight) / 2;

            graphics.beginPath();

            const points = path.map(point => ({
                x: startX + point.x * scaledTileWidth - (point.x * overlap) + scaledTileWidth / 2,
                y: startY + point.y * scaledTileHeight + scaledTileHeight / 2
            }));

            graphics.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length; i++) {
                graphics.lineTo(points[i].x, points[i].y);
            }

            graphics.strokePath();

            points.forEach(point => {
                graphics.fillStyle(0x00ff00, 1);
                graphics.fillCircle(point.x, point.y, 3);
            });

            this.time.delayedCall(300, () => {
                graphics.destroy();
            });
        }
    }

    matchTiles(tile1, tile2) {
        this.tweens.add({
            targets: [tile1, tile2],
            scale: 0,
            duration: 200,
            onComplete: () => {
                this.tiles[tile1.gridY][tile1.gridX] = null;
                this.tiles[tile2.gridY][tile2.gridX] = null;
                
                this.tileSprites[tile1.gridY][tile1.gridX].destroy();
                this.tileSprites[tile2.gridY][tile2.gridX].destroy();
                this.tileSprites[tile1.gridY][tile1.gridX] = null;
                this.tileSprites[tile2.gridY][tile2.gridX] = null;

                this.remainingTiles -= 2;
                
                if (this.remainingTiles === 0) {
                    this.showVictoryMessage();
                } else {
                    // 检查是否还有可行解
                    if (!this.checkHasSolution()) {
                        this.showNoSolutionMessage();
                    }
                }
            }
        });
    }

    showVictoryMessage() {
        const text = this.add.text(400, 300, '恭喜通关！', {
            fontSize: '64px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);

        const nextLevel = this.currentLevel + 1;
        const hasNextLevel = LEVELS[this.difficulty].some(l => l.id === nextLevel);

        if (hasNextLevel) {
            const nextButton = this.add.text(400, 400, '下一关', {
                fontSize: '32px',
                fill: '#fff',
                backgroundColor: '#4a90e2',
                padding: { x: 20, y: 10 }
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                const nextLevelConfig = LEVELS[this.difficulty].find(l => l.id === nextLevel);
                this.scene.restart({ 
                    difficulty: this.difficulty, 
                    levelId: nextLevel,
                    levelConfig: nextLevelConfig
                });
            });
        } else {
            this.time.delayedCall(2000, () => {
                this.scene.start(SCENES.MENU);
            });
        }
    }

    createMap() {
        // ...
        this.tiles = [];
        
        for (let y = 0; y < mapData.length; y++) {
            this.tiles[y] = [];
            for (let x = 0; x < mapData[y].length; x++) {
                if (mapData[y][x] === null) {
                    this.tiles[y][x] = null;
                    continue; // 跳过空白区域的渲染
                }
                
                // 创建实际的tile
                const tile = new Tile(this, x, y, mapData[y][x]);
                this.tiles[y][x] = tile;
                // ...其他tile初始化逻辑
            }
        }
    }
    
    // 修改任何涉及tile访问的方法，需要考虑null的情况
    getTileAt(x, y) {
        if (y < 0 || y >= this.tiles.length || 
            x < 0 || x >= this.tiles[y].length) {
            return null;
        }
        return this.tiles[y][x];
    }

    checkHasSolution() {
        // 遍历所有瓦片，检查是否存���可连接的对子
        for (let y1 = 0; y1 < this.tiles.length; y1++) {
            for (let x1 = 0; x1 < this.tiles[y1].length; x1++) {
                if (!this.tiles[y1][x1]) continue; // 跳过空瓦片
                
                // 从当前瓦片开始，检查与其他所有瓦片的连接可能
                for (let y2 = y1; y2 < this.tiles.length; y2++) {
                    const startX = (y2 === y1) ? x1 + 1 : 0; // 避免重复检查
                    for (let x2 = startX; x2 < this.tiles[y2].length; x2++) {
                        if (!this.tiles[y2][x2]) continue; // 跳过空瓦片
                        
                        // 检查两个瓦片是否可以连接
                        if (this.tiles[y1][x1] === this.tiles[y2][x2] && 
                            this.pathFinder.findPath(x1, y1, x2, y2).success) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    // 添加显示无解消息的方法
    showNoSolutionMessage() {
        const text = this.add.text(400, 300, '没有可消除的对子了！', {
            fontSize: '32px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // 添加���试按钮
        const retryButton = this.add.text(400, 380, '重试本关', {
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: '#4a90e2',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.restart({ 
                difficulty: this.difficulty, 
                levelId: this.currentLevel,
                levelConfig: this.levelConfig
            });
        });

        // 添加返回菜单按钮
        const menuButton = this.add.text(400, 440, '返回菜单', {
            fontSize: '24px',
            fill: '#fff',
            backgroundColor: '#4a90e2',
            padding: { x: 20, y: 10 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start(SCENES.MENU);
        });
    }
} 