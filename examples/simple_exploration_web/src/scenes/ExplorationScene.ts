import Phaser from 'phaser';

interface Entity {
  x: number;
  y: number;
  originalColor: number;
  currentColor: number;
  emotion: string;
  blendProgress: number;
  blendStartColor: number;
  blendDuration: number;
  graphics?: Phaser.GameObjects.Graphics;
}

export default class ExplorationScene extends Phaser.Scene {
  private gridWidth = 10;
  private gridHeight = 10;
  private cellSize = 40;
  private padding = 20;
  private moveInterval = 0.25;
  private playerColor = 0x00ff00;
  private blendDuration = 2.0;

  private playerGridX = 5;
  private playerGridY = 5;
  private playerVisualX = 5;
  private playerVisualY = 5;
  private playerGraphics?: Phaser.GameObjects.Graphics;
  private playerLabel?: Phaser.GameObjects.Text;
  private playerTween?: Phaser.Tweens.Tween;

  private moveTimer = 0;
  private lastInput: string | null = null;

  private entities: Entity[] = [];
  private entityGraphics: Phaser.GameObjects.Graphics[] = [];

  private gridGraphics?: Phaser.GameObjects.Graphics;
  private hudText?: Phaser.GameObjects.Text;
  private frameCount = 0;
  private fpsTimer = 0;
  private currentFps = 0;

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('ExplorationScene');
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

  update(time: number, delta: number) {
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
    let moveDirection: { dx: number; dy: number } | null = null;

    if (this.cursors?.up.isDown) {
      moveDirection = { dx: 0, dy: -1 };
      this.lastInput = 'UP';
    } else if (this.cursors?.down.isDown) {
      moveDirection = { dx: 0, dy: 1 };
      this.lastInput = 'DOWN';
    } else if (this.cursors?.left.isDown) {
      moveDirection = { dx: -1, dy: 0 };
      this.lastInput = 'LEFT';
    } else if (this.cursors?.right.isDown) {
      moveDirection = { dx: 1, dy: 0 };
      this.lastInput = 'RIGHT';
    } else {
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
        entity.currentColor = this.lerpColor(
          entity.blendStartColor,
          this.playerColor,
          entity.blendProgress
        );
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
      } else {
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

  private drawGrid() {
    if (!this.gridGraphics) return;

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

  private drawEntity(graphics: Phaser.GameObjects.Graphics, entity: Entity) {
    const x = this.padding + entity.x * this.cellSize + 2;
    const y = this.padding + entity.y * this.cellSize + 2;
    const size = this.cellSize - 4;

    graphics.clear();
    graphics.fillStyle(entity.currentColor);
    graphics.fillRect(x, y, size, size);
  }

  private drawPlayer() {
    if (!this.playerGraphics || !this.playerLabel) return;

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

  private animatePlayerMove(newX: number, newY: number) {
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

  private lerpColor(colorA: number, colorB: number, t: number): number {
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

  private startEntityBlend(entity: Entity): void {
    // Save current color as blend start color
    entity.blendStartColor = entity.currentColor;
    // Reset blend progress to start the animation
    entity.blendProgress = 0;
  }
}
