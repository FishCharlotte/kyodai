export default class PathFinder {
    constructor(tiles) {
        this.tiles = tiles;
        this.width = tiles[0].length;
        this.height = tiles.length;
    }

    findPath(x1, y1, x2, y2) {
        console.log("findPath", this.tiles);
        
        // 检查起点和终点是否有效
        if (!this.isValidPos(x1, y1) || !this.isValidPos(x2, y2)) {
            return { success: false, path: [] };
        }

        // 直线连接
        if (this.checkDirectLine(x1, y1, x2, y2)) {
            return { success: true, path: [
                { x: x1, y: y1 },
                { x: x2, y: y2 }
            ]};
        }

        // 一个拐点连接
        const oneCornerResult = this.checkOneCorner(x1, y1, x2, y2);
        if (oneCornerResult.success) {
            return oneCornerResult;
        }

        // 两个拐点连接
        const twoCornerResult = this.checkTwoCorners(x1, y1, x2, y2);
        if (twoCornerResult.success) {
            return twoCornerResult;
        }

        return { success: false, path: [] };
    }

    checkDirectLine(x1, y1, x2, y2) {
        if (x1 === x2) {
            // 垂直线
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);
            for (let y = minY + 1; y < maxY; y++) {
                if (this.getTileAt(x1, y) !== null) {
                    return false;
                }
            }
            return true;
        } else if (y1 === y2) {
            // 水平线
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            for (let x = minX + 1; x < maxX; x++) {
                if (this.getTileAt(x, y1) !== null) {
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    isValidPos(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    getTileAt(x, y) {
        if (!this.isValidPos(x, y)) return null;
        return this.tiles[y][x];
    }

    checkOneCorner(x1, y1, x2, y2) {
        const corners = [
            { x: x1, y: y2 }, // 水平-垂直
            { x: x2, y: y1 }  // 垂直-水平
        ];

        for (const corner of corners) {
            if (this.getTileAt(corner.x, corner.y) === null) {
                if (this.checkDirectLine(x1, y1, corner.x, corner.y) && 
                    this.checkDirectLine(corner.x, corner.y, x2, y2)) {
                    return {
                        success: true,
                        path: [
                            { x: x1, y: y1 },
                            { x: corner.x, y: corner.y },
                            { x: x2, y: y2 }
                        ]
                    };
                }
            }
        }
        return { success: false, path: [] };
    }

    checkTwoCorners(x1, y1, x2, y2) {
        // 水平方向扫描
        for (let x = 0; x < this.width; x++) {
            const corner1 = { x, y: y1 };
            const corner2 = { x, y: y2 };

            if (x === x1 || x === x2) continue;

            if (this.getTileAt(corner1.x, corner1.y) === null && 
                this.getTileAt(corner2.x, corner2.y) === null) {
                if (this.checkDirectLine(x1, y1, corner1.x, corner1.y) &&
                    this.checkDirectLine(corner1.x, corner1.y, corner2.x, corner2.y) &&
                    this.checkDirectLine(corner2.x, corner2.y, x2, y2)) {
                    return {
                        success: true,
                        path: [
                            { x: x1, y: y1 },
                            { x: corner1.x, y: corner1.y },
                            { x: corner2.x, y: corner2.y },
                            { x: x2, y: y2 }
                        ]
                    };
                }
            }
        }

        // 垂直方向扫描
        for (let y = 0; y < this.height; y++) {
            const corner1 = { x: x1, y };
            const corner2 = { x: x2, y };

            if (y === y1 || y === y2) continue;

            if (this.getTileAt(corner1.x, corner1.y) === null && 
                this.getTileAt(corner2.x, corner2.y) === null) {
                if (this.checkDirectLine(x1, y1, corner1.x, corner1.y) &&
                    this.checkDirectLine(corner1.x, corner1.y, corner2.x, corner2.y) &&
                    this.checkDirectLine(corner2.x, corner2.y, x2, y2)) {
                    return {
                        success: true,
                        path: [
                            { x: x1, y: y1 },
                            { x: corner1.x, y: corner1.y },
                            { x: corner2.x, y: corner2.y },
                            { x: x2, y: y2 }
                        ]
                    };
                }
            }
        }

        return { success: false, path: [] };
    }

    isWalkable(x, y) {
        const tile = this.scene.getTileAt(x, y);
        // 空白区域视为不可通行
        if (tile === null) {
            return false;
        }
        return tile.isWalkable();
    }
}