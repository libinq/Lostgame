class Player {
    constructor(scene, maze) {
        this.maze = maze;
        this.position = { ...maze.getStartPosition() };
        this.speed = 5;
        this.mesh = this.createPlayerMesh();
        scene.add(this.mesh);
        
        this.setupControls();
    }

    createPlayerMesh() {
        const geometry = new THREE.SphereGeometry(0.3, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const mesh = new THREE.Mesh(geometry, material);
        
        // 设置初始位置
        mesh.position.set(
            this.position.x,
            0.3, // 高度
            this.position.z
        );
        
        return mesh;
    }

    setupControls() {
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };

        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.keys.up = true;
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.keys.down = true;
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.keys.left = true;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.keys.right = true;
                    break;
            }
        });

        window.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.keys.up = false;
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.keys.down = false;
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.keys.right = false;
                    break;
            }
        });
    }

    update(deltaTime) {
        const moveDistance = this.speed * deltaTime;
        const grid = this.maze.getGrid();
        
        // 计算新位置
        let newX = this.position.x;
        let newZ = this.position.z;
        
        if (this.keys.up) newZ -= moveDistance;
        if (this.keys.down) newZ += moveDistance;
        if (this.keys.left) newX -= moveDistance;
        if (this.keys.right) newX += moveDistance;
        
        // 检查碰撞
        const gridX = Math.floor(newX);
        const gridZ = Math.floor(newZ);
        
        // 确保在网格范围内
        if (gridX >= 0 && gridX < grid[0].length && gridZ >= 0 && gridZ < grid.length) {
            // 检查是否是墙
            if (grid[gridZ][gridX] !== 1) {
                this.position.x = newX;
                this.position.z = newZ;
                
                // 更新网格中的位置
                this.mesh.position.set(this.position.x, 0.3, this.position.z);
            }
        }
        
        // 检查是否到达终点
        const endPos = this.maze.getEndPosition();
        if (Math.abs(this.position.x - endPos.x) < 0.5 && Math.abs(this.position.z - endPos.z) < 0.5) {
            return true; // 返回true表示到达终点
        }
        
        return false;
    }

    reset(maze) {
        this.maze = maze;
        this.position = { ...maze.getStartPosition() };
        this.mesh.position.set(this.position.x, 0.3, this.position.z);
    }

    getMesh() {
        return this.mesh;
    }
}