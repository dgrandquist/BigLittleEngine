import Phaser from 'phaser';
export default class ExplorationScene extends Phaser.Scene {
    constructor() {
        super('ExplorationScene');
        Object.defineProperty(this, "gridWidth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 10
        });
        Object.defineProperty(this, "gridHeight", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 10
        });
        Object.defineProperty(this, "cellSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 40
        });
        Object.defineProperty(this, "padding", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 20
        });
        Object.defineProperty(this, "moveInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 1.0
        });
        Object.defineProperty(this, "playerColor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0x00ff00
        });
        Object.defineProperty(this, "blendDuration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 2.0
        });
        Object.defineProperty(this, "playerGridX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5
        });
        Object.defineProperty(this, "playerGridY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5
        });
        Object.defineProperty(this, "playerVisualX", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5
        });
        Object.defineProperty(this, "playerVisualY", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5
        });
        Object.defineProperty(this, "playerGraphics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "playerLabel", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "playerTween", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "moveTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "lastInput", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "entities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "entityGraphics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "gridGraphics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hudText", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "frameCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "fpsTimer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "currentFps", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "cursors", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    create() {
        // Initialize entities
        this.entities = [
            { x: 1, y: 1, originalColor: 0x0000ff, currentColor: 0x0000ff, emotion: 'sad', blendProgress: -1, blendStartColor: 0x0000ff, blendDuration: this.blendDuration },
            { x: 8, y: 2, originalColor: 0xffff00, currentColor: 0xffff00, emotion: 'neutral', blendProgress: -1, blendStartColor: 0xffff00, blendDuration: this.blendDuration },
            { x: 3, y: 7, originalColor: 0xff0000, currentColor: 0xff0000, emotion: 'angry', blendProgress: -1, blendStartColor: 0xff0000, blendDuration: this.blendDuration },
            { x: 7, y: 8, originalColor: 0x800080, currentColor: 0x800080, emotion: 'curious', blendProgress: -1, blendStartColor: 0x800080, blendDuration: this.blendDuration },
            { x: 5, y: 2, originalColor: 0xff8000, currentColor: 0xff8000, emotion: 'excited', blendProgress: -1, blendStartColor: 0xff8000, blendDuration: this.blendDuration },
        ];
        // Draw grid
        this.gridGraphics = this.add.graphics();
        this.drawGrid();
        // Draw entities
        this.entities.forEach((entity) => {
            const g = this.add.graphics();
            this.entityGraphics.push(g);
            entity.graphics = g;
            this.drawEntity(g, entity);
        });
        // Draw player
        this.playerGraphics = this.add.graphics();
        this.playerLabel = this.add.text(0, 0, 'YOU', { font: 'bold 14px Arial', color: '#ffffff' });
        this.playerLabel.setDepth(10);
        this.drawPlayer();
        // Create HUD text
        this.hudText = this.add.text(10, 10, '', { font: '14px Arial', color: '#ffffff' });
        this.hudText.setDepth(100);
        // Setup input
        this.cursors = this.input.keyboard?.createCursorKeys();
    }
    update(time, delta) {
        const deltaSeconds = delta / 1000;
        // Update FPS
        this.frameCount++;
        this.fpsTimer += deltaSeconds;
        if (this.fpsTimer >= 0.1) {
            this.currentFps = this.frameCount / this.fpsTimer;
            this.frameCount = 0;
            this.fpsTimer = 0;
        }
        // Handle input
        let moveDirection = null;
        if (this.cursors?.up.isDown) {
            moveDirection = { dx: 0, dy: -1 };
            this.lastInput = 'UP';
        }
        else if (this.cursors?.down.isDown) {
            moveDirection = { dx: 0, dy: 1 };
            this.lastInput = 'DOWN';
        }
        else if (this.cursors?.left.isDown) {
            moveDirection = { dx: -1, dy: 0 };
            this.lastInput = 'LEFT';
        }
        else if (this.cursors?.right.isDown) {
            moveDirection = { dx: 1, dy: 0 };
            this.lastInput = 'RIGHT';
        }
        else {
            this.lastInput = null;
        }
        // Update entity blends
        this.entities.forEach((entity) => {
            if (entity.blendProgress >= 0 && entity.blendProgress < 1) {
                entity.blendProgress += deltaSeconds / entity.blendDuration;
                if (entity.blendProgress > 1) {
                    entity.blendProgress = 1;
                }
                // Update color based on blend progress
                entity.currentColor = this.lerpColor(entity.blendStartColor, this.playerColor, entity.blendProgress);
                // Redraw entity with new color
                if (entity.graphics) {
                    this.drawEntity(entity.graphics, entity);
                }
            }
        });
        // Update move timer
        this.moveTimer += deltaSeconds;
        // Execute move when ready
        if (this.moveTimer >= this.moveInterval && moveDirection) {
            const newX = Math.max(0, Math.min(this.gridWidth - 1, this.playerGridX + moveDirection.dx));
            const newY = Math.max(0, Math.min(this.gridHeight - 1, this.playerGridY + moveDirection.dy));
            // Check if square is occupied by an entity
            const touchedEntity = this.entities.find(e => e.x === newX && e.y === newY);
            if (touchedEntity) {
                // Start blend on touched entity (from current color to player color)
                this.startEntityBlend(touchedEntity);
                // Don't reset timer - let player try a different direction immediately
            }
            else {
                // Move only if not occupied
                this.playerGridX = newX;
                this.playerGridY = newY;
                this.animatePlayerMove(newX, newY);
                // Only reset timer on successful movement
                this.moveTimer = 0;
            }
        }
        // Update HUD
        const timeUntilNext = Math.max(0, this.moveInterval - this.moveTimer);
        const inputStr = this.lastInput || 'none';
        const hudContent = `FPS: ${Math.round(this.currentFps)} | Position: (${this.playerGridX}, ${this.playerGridY}) | Next move in: ${timeUntilNext.toFixed(2)}s | Input: ${inputStr}`;
        this.hudText?.setText(hudContent);
    }
    drawGrid() {
        if (!this.gridGraphics)
            return;
        this.gridGraphics.clear();
        this.gridGraphics.lineStyle(1, 0x808080);
        // Vertical lines
        for (let x = 0; x <= this.gridWidth; x++) {
            const xPos = this.padding + x * this.cellSize;
            this.gridGraphics.moveTo(xPos, this.padding);
            this.gridGraphics.lineTo(xPos, this.padding + this.gridHeight * this.cellSize);
        }
        // Horizontal lines
        for (let y = 0; y <= this.gridHeight; y++) {
            const yPos = this.padding + y * this.cellSize;
            this.gridGraphics.moveTo(this.padding, yPos);
            this.gridGraphics.lineTo(this.padding + this.gridWidth * this.cellSize, yPos);
        }
        this.gridGraphics.strokePath();
    }
    drawEntity(graphics, entity) {
        const x = this.padding + entity.x * this.cellSize + 2;
        const y = this.padding + entity.y * this.cellSize + 2;
        const size = this.cellSize - 4;
        graphics.clear();
        graphics.fillStyle(entity.currentColor);
        graphics.fillRect(x, y, size, size);
    }
    drawPlayer() {
        if (!this.playerGraphics || !this.playerLabel)
            return;
        this.playerGraphics.clear();
        // Use visual position for smooth animation
        const x = this.padding + this.playerVisualX * this.cellSize;
        const y = this.padding + this.playerVisualY * this.cellSize;
        const size = this.cellSize;
        // Border
        this.playerGraphics.lineStyle(2, 0xffffff);
        this.playerGraphics.strokeRect(x, y, size, size);
        // Fill
        this.playerGraphics.fillStyle(0x00ff00);
        this.playerGraphics.fillRect(x + 2, y + 2, size - 4, size - 4);
        // Update label position
        this.playerLabel.setPosition(x + 8, y + 15);
    }
    animatePlayerMove(newX, newY) {
        if (this.playerTween) {
            this.playerTween.stop();
        }
        // Tween the visual position smoothly over 1 second
        this.playerTween = this.tweens.add({
            targets: this,
            playerVisualX: newX,
            playerVisualY: newY,
            duration: this.moveInterval * 1000,
            ease: 'Linear',
            onUpdate: () => {
                this.drawPlayer();
            },
        });
    }
    lerpColor(colorA, colorB, t) {
        const rA = (colorA >> 16) & 0xff;
        const gA = (colorA >> 8) & 0xff;
        const bA = colorA & 0xff;
        const rB = (colorB >> 16) & 0xff;
        const gB = (colorB >> 8) & 0xff;
        const bB = colorB & 0xff;
        const r = Math.round(rA + (rB - rA) * t);
        const g = Math.round(gA + (gB - gA) * t);
        const b = Math.round(bA + (bB - bA) * t);
        return (r << 16) | (g << 8) | b;
    }
    startEntityBlend(entity) {
        // Save current color as blend start color
        entity.blendStartColor = entity.currentColor;
        // Reset blend progress to start the animation
        entity.blendProgress = 0;
    }
}
