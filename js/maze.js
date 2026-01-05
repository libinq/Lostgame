class Maze {
    constructor(level) {
        this.level = level;
        this.size = this.calculateSize(level);
        this.grid = [];
        this.startPosition = { x: 1, z: 1 };
        this.endPosition = { x: this.size - 2, z: this.size - 2 };
        this.generateMaze();
    }

    calculateSize(level) {
        // 随着关卡增加，迷宫尺寸增大
        return 5 + (level * 2);
    }

    generateMaze() {
        // 初始化网格，所有单元格都是墙
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = 1; // 1表示墙
            }
        }

        // 使用递归回溯算法生成迷宫
        this.carvePassages(1, 1);

        // 设置起点和终点
        this.grid[this.startPosition.z][this.startPosition.x] = 0;
        this.grid[this.endPosition.z][this.endPosition.x] = 2; // 2表示终点
    }

    carvePassages(x, z) {
        // 标记当前单元格为通道
        this.grid[z][x] = 0;

        // 定义四个方向：上、右、下、左
        const directions = [
            { dx: 0, dz: -2 }, // 上
            { dx: 2, dz: 0 },  // 右
            { dx: 0, dz: 2 },  // 下
            { dx: -2, dz: 0 }  // 左
        ];

        // 随机排序方向
        this.shuffleArray(directions);

        // 尝试每个方向
        for (const dir of directions) {
            const nx = x + dir.dx;
            const nz = z + dir.dz;

            // 检查是否在边界内且未访问过
            if (nx > 0 && nx < this.size - 1 && nz > 0 && nz < this.size - 1 && this.grid[nz][nx] === 1) {
                // 打通墙壁
                this.grid[z + dir.dz / 2][x + dir.dx / 2] = 0;
                // 递归处理下一个单元格
                this.carvePassages(nx, nz);
            }
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // 添加一些障碍和陷阱（随着关卡增加）
    addObstacles() {
        const obstacleCount = Math.floor(this.level / 2);
        
        for (let i = 0; i < obstacleCount; i++) {
            let x, z;
            do {
                x = Math.floor(Math.random() * (this.size - 2)) + 1;
                z = Math.floor(Math.random() * (this.size - 2)) + 1;
            } while (
                this.grid[z][x] !== 0 || 
                (x === this.startPosition.x && z === this.startPosition.z) ||
                (x === this.endPosition.x && z === this.endPosition.z)
            );
            
            this.grid[z][x] = 3; // 3表示障碍物
        }
    }

    getGrid() {
        return this.grid;
    }

    getStartPosition() {
        return this.startPosition;
    }

    getEndPosition() {
        return this.endPosition;
    }

    getSize() {
        return this.size;
    }
}