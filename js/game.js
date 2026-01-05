class Game {
    constructor() {
        this.currentLevel = 1;
        this.maxLevel = 10;
        this.gameStarted = false;
        this.gameOver = false;
        this.levelCompleted = false;
        this.timer = 0;
        this.timerInterval = null;
        
        this.setupUI();
        this.setupScene();
    }

    setupUI() {
        // 获取UI元素
        this.startScreen = document.getElementById('start-screen');
        this.levelCompleteScreen = document.getElementById('level-complete');
        this.gameOverScreen = document.getElementById('game-over');
        this.currentLevelElement = document.getElementById('current-level');
        this.timeCounter = document.getElementById('time-counter');
        this.levelTimeElement = document.getElementById('level-time');
        this.finalLevelElement = document.getElementById('final-level');
        
        // 设置按钮事件
        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('next-level').addEventListener('click', () => this.nextLevel());
        document.getElementById('restart-button').addEventListener('click', () => this.restartGame());
    }

    setupScene() {
        // 创建Three.js场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // 天空蓝色背景
        
        // 创建相机
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('game-canvas').appendChild(this.renderer.domElement);
        
        // 添加灯光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);
        
        // 窗口大小调整
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // 初始化时钟
        this.clock = new THREE.Clock();
    }

    startGame() {
        this.gameStarted = true;
        this.gameOver = false;
        this.currentLevel = 1;
        this.startScreen.style.display = 'none';
        
        this.startLevel();
    }

    startLevel() {
        // 更新UI
        this.currentLevelElement.textContent = this.currentLevel;
        
        // 清除之前的迷宫
        this.clearMaze();
        
        // 创建新迷宫
        this.maze = new Maze(this.currentLevel);
        
        // 创建迷宫模型
        this.createMazeModel();
        
        // 创建玩家
        this.player = new Player(this.scene, this.maze);
        
        // 设置相机位置
        const mazeSize = this.maze.getSize();
        this.camera.position.set(mazeSize / 2, mazeSize, mazeSize / 2 + 5);
        this.camera.lookAt(mazeSize / 2, 0, mazeSize / 2);
        
        // 开始计时
        this.timer = 0;
        this.startTimer();
        
        // 开始游戏循环
        if (!this.animationFrameId) {
            this.animate();
        }
    }

    clearMaze() {
        // 移除之前的迷宫墙壁和玩家
        if (this.mazeWalls) {
            this.mazeWalls.forEach(wall => this.scene.remove(wall));
            this.mazeWalls = [];
        }
        
        if (this.player) {
            this.scene.remove(this.player.getMesh());
        }
        
        // 停止计时器
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }

    createMazeModel() {
        const grid = this.maze.getGrid();
        const size = this.maze.getSize();
        this.mazeWalls = [];
        
        // 墙壁材质
        const wallMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x8B4513,  // 棕色墙壁
            flatShading: true
        });
        
        // 地板材质
        const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x999999 });
        
        // 终点材质
        const exitMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        
        // 创建地板
        const floorGeometry = new THREE.PlaneGeometry(size, size);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(size / 2 - 0.5, -0.5, size / 2 - 0.5);
        this.scene.add(floor);
        this.mazeWalls.push(floor);
        
        // 创建墙壁和终点
        const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
        
        for (let z = 0; z < size; z++) {
            for (let x = 0; x < size; x++) {
                if (grid[z][x] === 1) {  // 墙
                    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
                    wall.position.set(x, 0, z);
                    this.scene.add(wall);
                    this.mazeWalls.push(wall);
                } else if (grid[z][x] === 2) {  // 终点
                    const exit = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16),
                        exitMaterial
                    );
                    exit.position.set(x, -0.45, z);
                    this.scene.add(exit);
                    this.mazeWalls.push(exit);
                }
            }
        }
        
        // 添加一些2.5D效果 - 墙壁阴影和高度变化
        if (this.currentLevel > 1) {
            for (let i = 0; i < this.mazeWalls.length; i++) {
                if (this.mazeWalls[i].geometry.type === 'BoxGeometry') {
                    // 随机调整墙壁高度，增加2.5D效果
                    const heightVariation = 0.5 + (Math.random() * 0.5);
                    this.mazeWalls[i].scale.y = heightVariation;
                    this.mazeWalls[i].position.y = heightVariation / 2 - 0.5;
                }
            }
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.timeCounter.textContent = this.timer;
        }, 1000);
    }

    animate() {
        this.animationFrameId = requestAnimationFrame(() => this.animate());
        
        if (this.gameStarted && !this.gameOver && !this.levelCompleted) {
            const deltaTime = this.clock.getDelta();
            
            // 更新玩家位置
            const reachedExit = this.player.update(deltaTime);
            
            // 检查是否到达终点
            if (reachedExit) {
                this.completeLevel();
            }
        }
        
        this.renderer.render(this.scene, this.camera);
    }

    completeLevel() {
        this.levelCompleted = true;
        clearInterval(this.timerInterval);
        
        // 显示关卡完成界面
        this.levelTimeElement.textContent = this.timer;
        this.levelCompleteScreen.style.display = 'block';
        
        // 检查是否是最后一关
        if (this.currentLevel >= this.maxLevel) {
            this.endGame();
        }
    }

    nextLevel() {
        this.levelCompleted = false;
        this.levelCompleteScreen.style.display = 'none';
        this.currentLevel++;
        
        this.startLevel();
    }

    endGame() {
        this.gameOver = true;
        this.finalLevelElement.textContent = this.currentLevel;
        this.levelCompleteScreen.style.display = 'none';
        this.gameOverScreen.style.display = 'block';
    }

    restartGame() {
        this.gameOverScreen.style.display = 'none';
        this.startGame();
    }
}

// 当页面加载完成后初始化游戏
window.addEventListener('load', () => {
    const game = new Game();
});