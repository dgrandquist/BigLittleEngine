import Phaser from 'phaser';

interface Entity {
  x: number;
  y: number;
  visualX: number;
  visualY: number;
  originalColor: number;
  currentColor: number;
  emotion: string;
  need: string;
  blendProgress: number;
  blendStartColor: number;
  blendTargetColor: number;
  blendDuration: number;
  moveTimer: number;
  targetX?: number;
  targetY?: number;
  growingSquares?: GrowingSquare[];
  graphics?: Phaser.GameObjects.Graphics;
  label?: Phaser.GameObjects.Text;
}

interface GrowingSquare {
  x: number;
  y: number;
  sourceX: number;
  sourceY: number;
  emotion: string;
  color: number;
  launchProgress: number;
  growthProgress: number;
  launchDuration: number;
  growthDuration: number;
  graphics?: Phaser.GameObjects.Graphics;
  label?: Phaser.GameObjects.Text;
}

export default class ExplorationScene extends Phaser.Scene {
  private gridWidth = 20;
  private gridHeight = 20;
  private cellSize = 20;
  private padding = 5;
  private hudHeight = 50;
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
    // Initialize entities (spread across larger 20x20 grid)
    this.entities = [
      { x: 2, y: 2, visualX: 2, visualY: 2, originalColor: 0x0000ff, currentColor: 0x0000ff, emotion: 'sad', need: 'FLEE', blendProgress: -1, blendStartColor: 0x0000ff, blendTargetColor: 0x0000ff, blendDuration: this.blendDuration, moveTimer: 0, growingSquares: [] },
      { x: 18, y: 3, visualX: 18, visualY: 3, originalColor: 0xffff00, currentColor: 0xffff00, emotion: 'neutral', need: 'ROAM', blendProgress: -1, blendStartColor: 0xffff00, blendTargetColor: 0xffff00, blendDuration: this.blendDuration, moveTimer: 0, growingSquares: [] },
      { x: 5, y: 15, visualX: 5, visualY: 15, originalColor: 0xff0000, currentColor: 0xff0000, emotion: 'angry', need: 'SEEK', blendProgress: -1, blendStartColor: 0xff0000, blendTargetColor: 0xff0000, blendDuration: this.blendDuration, moveTimer: 0, growingSquares: [] },
      { x: 15, y: 10, visualX: 15, visualY: 10, originalColor: 0x800080, currentColor: 0x800080, emotion: 'curious', need: 'EXPLORE', blendProgress: -1, blendStartColor: 0x800080, blendTargetColor: 0x800080, blendDuration: this.blendDuration, moveTimer: 0, growingSquares: [] },
      { x: 10, y: 18, visualX: 10, visualY: 18, originalColor: 0xff8000, currentColor: 0xff8000, emotion: 'excited', need: 'VISIT', blendProgress: -1, blendStartColor: 0xff8000, blendTargetColor: 0xff8000, blendDuration: this.blendDuration, moveTimer: 0, growingSquares: [] },
    ];

    // Draw grid
    this.gridGraphics = this.add.graphics();
    this.drawGrid();

    // Draw entities and create labels
    this.entities.forEach((entity) => {
      const g = this.add.graphics();
      this.entityGraphics.push(g);
      entity.graphics = g;
      this.drawEntity(g, entity);

      // Create need label
      entity.label = this.add.text(0, 0, entity.need, { font: 'bold 9px Arial', color: '#ffffff' });
      entity.label.setDepth(20);
    });

    // Draw player
    this.playerGraphics = this.add.graphics();
    this.playerLabel = this.add.text(0, 0, 'YOU', { font: 'bold 14px Arial', color: '#ffffff' });
    this.playerLabel.setDepth(10);
    this.drawPlayer();

    // Create HUD text (above grid)
    this.hudText = this.add.text(5, 5, '', { font: '12px Arial', color: '#ffffff' });
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

    // Update growing squares
    this.entities.forEach((entity) => {
      if (!entity.growingSquares) entity.growingSquares = [];

      entity.growingSquares.forEach((growing, index) => {
        // Update launch animation
        if (growing.launchProgress < 1) {
          growing.launchProgress += deltaSeconds / growing.launchDuration;
          if (growing.launchProgress >= 1) {
            growing.launchProgress = 1;
          }
        }

        // Update growth animation (starts after launch completes)
        if (growing.launchProgress === 1 && growing.growthProgress < 1) {
          growing.growthProgress += deltaSeconds / growing.growthDuration;
          if (growing.growthProgress > 1) {
            growing.growthProgress = 1;
          }
        }

        // When fully grown, add to entities and remove from growing
        if (growing.growthProgress === 1) {
          this.spawnFullyGrownEntity(growing);
          entity.growingSquares!.splice(index, 1);
        }

        // Render growing square
        this.drawGrowingSquare(growing);
      });
    });

    // Update entity movement
    this.entities.forEach((entity) => {
      entity.moveTimer += deltaSeconds;

      if (entity.moveTimer >= this.moveInterval) {
        // Green (happy) entities don't move
        if (entity.currentColor !== 0x00ff00) {
          const move = this.getBehaviorMove(entity);
          if (move) {
            // Check if destination is occupied by another entity or growing square
            const occupiedByEntity = this.entities.find(
              e => e !== entity && e.x === move.x && e.y === move.y
            );

            const occupiedByGrowing = this.entities.some(
              e => e.growingSquares?.some(g => g.x === move.x && g.y === move.y)
            );

            if (occupiedByEntity || occupiedByGrowing) {
              // Can't move there, but trigger blend collision if entity
              if (occupiedByEntity) {
                this.blendEntityTowards(occupiedByEntity, entity.currentColor);
              }
            } else {
              // Move to empty cell
              entity.x = move.x;
              entity.y = move.y;
            }
          }
        }
        entity.moveTimer = 0;
      }

      // Smooth visual movement
      entity.visualX = entity.x;
      entity.visualY = entity.y;
    });

    // Update entity blends and redraw all entities
    this.entities.forEach((entity) => {
      if (entity.blendProgress >= 0 && entity.blendProgress < 1) {
        entity.blendProgress += deltaSeconds / entity.blendDuration;
        if (entity.blendProgress > 1) {
          entity.blendProgress = 1;
        }
        // Update color based on blend progress toward target color
        entity.currentColor = this.lerpColor(
          entity.blendStartColor,
          entity.blendTargetColor,
          entity.blendProgress
        );

        // When blend completes, update emotion to match new color
        if (entity.blendProgress === 1) {
          this.updateEmotionFromColor(entity);
        }
      }

      // Redraw entity every frame (movement + blending)
      if (entity.graphics) {
        this.drawEntity(entity.graphics, entity);
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

    const gridStartY = this.hudHeight;

    // Vertical lines
    for (let x = 0; x <= this.gridWidth; x++) {
      const xPos = this.padding + x * this.cellSize;
      this.gridGraphics.moveTo(xPos, gridStartY + this.padding);
      this.gridGraphics.lineTo(xPos, gridStartY + this.padding + this.gridHeight * this.cellSize);
    }

    // Horizontal lines
    for (let y = 0; y <= this.gridHeight; y++) {
      const yPos = gridStartY + this.padding + y * this.cellSize;
      this.gridGraphics.moveTo(this.padding, yPos);
      this.gridGraphics.lineTo(this.padding + this.gridWidth * this.cellSize, yPos);
    }

    this.gridGraphics.strokePath();
  }

  private drawEntity(graphics: Phaser.GameObjects.Graphics, entity: Entity) {
    const x = this.padding + entity.visualX * this.cellSize + 2;
    const y = this.hudHeight + this.padding + entity.visualY * this.cellSize + 2;
    const size = this.cellSize - 4;

    graphics.clear();
    graphics.fillStyle(entity.currentColor);
    graphics.fillRect(x, y, size, size);

    // Update label position (centered in cell, small font)
    if (entity.label) {
      entity.label.setPosition(x + 1, y + 3);
      entity.label.setFontSize(7);
    }
  }

  private drawPlayer() {
    if (!this.playerGraphics || !this.playerLabel) return;

    this.playerGraphics.clear();

    // Use visual position for smooth animation
    const x = this.padding + this.playerVisualX * this.cellSize;
    const y = this.hudHeight + this.padding + this.playerVisualY * this.cellSize;
    const size = this.cellSize;

    // Border
    this.playerGraphics.lineStyle(2, 0xffffff);
    this.playerGraphics.strokeRect(x, y, size, size);

    // Fill
    this.playerGraphics.fillStyle(0x00ff00);
    this.playerGraphics.fillRect(x + 2, y + 2, size - 4, size - 4);

    // Update label position (small, inside cell)
    this.playerLabel.setPosition(x + 3, y + 4);
    this.playerLabel.setFontSize(7);
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
    // Blend toward player color (green)
    this.blendEntityTowards(entity, this.playerColor);
  }

  private blendEntityTowards(entity: Entity, targetColor: number): void {
    // Save current color as blend start color
    entity.blendStartColor = entity.currentColor;
    // Set the target color for blending
    entity.blendTargetColor = targetColor;
    // Reset blend progress to start the animation
    entity.blendProgress = 0;
  }

  private updateEmotionFromColor(entity: Entity): void {
    // Map color to emotion and update behavior
    const colorToEmotion: { [key: number]: string } = {
      0x00ff00: 'happy',     // green = player's happy emotion
      0x0000ff: 'sad',       // blue
      0xffff00: 'neutral',   // yellow
      0xff0000: 'angry',     // red
      0x800080: 'curious',   // purple
      0xff8000: 'excited',   // orange
    };

    const newEmotion = colorToEmotion[entity.currentColor] || entity.emotion;
    entity.emotion = newEmotion;

    // Update need label to match new emotion
    const emotionToNeed: { [key: string]: string } = {
      happy: 'REST',
      sad: 'FLEE',
      neutral: 'ROAM',
      angry: 'SEEK',
      curious: 'EXPLORE',
      excited: 'VISIT',
    };
    entity.need = emotionToNeed[newEmotion] || entity.need;
  }

  private getBehaviorMove(entity: Entity): { x: number; y: number } | null {
    switch (entity.emotion) {
      case 'happy':
        return { x: entity.x, y: entity.y }; // Stay still
      case 'sad':
        return this.behaviorSad(entity);
      case 'neutral':
        return this.behaviorNeutral(entity);
      case 'angry':
        return this.behaviorAngry(entity);
      case 'curious':
        return this.behaviorCurious(entity);
      case 'excited':
        return this.behaviorExcited(entity);
      default:
        return null;
    }
  }

  private behaviorSad(entity: Entity): { x: number; y: number } {
    // Move away from nearest other entity
    let nearestEntity: Entity | null = null;
    let minDist = Infinity;

    for (const other of this.entities) {
      if (other === entity) continue;
      const dist = Math.abs(other.x - entity.x) + Math.abs(other.y - entity.y);
      if (dist < minDist) {
        minDist = dist;
        nearestEntity = other;
      }
    }

    if (!nearestEntity) return { x: entity.x, y: entity.y };

    // Move away from nearest
    const dx = entity.x - nearestEntity.x;
    const dy = entity.y - nearestEntity.y;
    const newX = Math.max(0, Math.min(this.gridWidth - 1, entity.x + (dx > 0 ? 1 : -1)));
    const newY = Math.max(0, Math.min(this.gridHeight - 1, entity.y + (dy > 0 ? 1 : -1)));
    return { x: newX, y: newY };
  }

  private behaviorNeutral(entity: Entity): { x: number; y: number } {
    // Random wandering
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    const dir = dirs[Math.floor(Math.random() * dirs.length)];
    const newX = Math.max(0, Math.min(this.gridWidth - 1, entity.x + dir[0]));
    const newY = Math.max(0, Math.min(this.gridHeight - 1, entity.y + dir[1]));
    return { x: newX, y: newY };
  }

  private behaviorAngry(entity: Entity): { x: number; y: number } {
    // Move toward a random other entity
    if (entity.targetX === undefined || entity.targetY === undefined || Math.random() < 0.3) {
      const others = this.entities.filter(e => e !== entity);
      if (others.length > 0) {
        const target = others[Math.floor(Math.random() * others.length)];
        entity.targetX = target.x;
        entity.targetY = target.y;
      }
    }

    if (entity.targetX === undefined || entity.targetY === undefined) return { x: entity.x, y: entity.y };

    const dx = entity.targetX - entity.x;
    const dy = entity.targetY - entity.y;
    const newX = entity.x + Math.sign(dx);
    const newY = entity.y + Math.sign(dy);

    return {
      x: Math.max(0, Math.min(this.gridWidth - 1, newX)),
      y: Math.max(0, Math.min(this.gridHeight - 1, newY)),
    };
  }

  private behaviorCurious(entity: Entity): { x: number; y: number } {
    // Try to spawn new growth if under limit
    if (entity.growingSquares && entity.growingSquares.length < 3) {
      if (Math.random() < 0.1) { // 10% chance each move to spawn
        this.launchNewGrowth(entity);
      }
    }

    // Move to different colors in sequence
    if (entity.targetX === undefined || entity.targetY === undefined) {
      const others = this.entities.filter(e => e !== entity);
      if (others.length > 0) {
        const target = others[Math.floor(Math.random() * others.length)];
        entity.targetX = target.x;
        entity.targetY = target.y;
      }
    }

    if (entity.targetX === undefined || entity.targetY === undefined) return { x: entity.x, y: entity.y };

    // Check if reached target
    if (entity.x === entity.targetX && entity.y === entity.targetY) {
      entity.targetX = undefined;
      entity.targetY = undefined;
    }

    const dx = (entity.targetX ?? entity.x) - entity.x;
    const dy = (entity.targetY ?? entity.y) - entity.y;
    const newX = entity.x + Math.sign(dx);
    const newY = entity.y + Math.sign(dy);

    return {
      x: Math.max(0, Math.min(this.gridWidth - 1, newX)),
      y: Math.max(0, Math.min(this.gridHeight - 1, newY)),
    };
  }

  private behaviorExcited(entity: Entity): { x: number; y: number } {
    // Visit all non-neutral entities
    if (entity.targetX === undefined || entity.targetY === undefined) {
      const others = this.entities.filter(e => e !== entity && e.emotion !== 'neutral');
      if (others.length > 0) {
        const target = others[Math.floor(Math.random() * others.length)];
        entity.targetX = target.x;
        entity.targetY = target.y;
      }
    }

    if (entity.targetX === undefined || entity.targetY === undefined) return { x: entity.x, y: entity.y };

    // Check if reached target
    if (entity.x === entity.targetX && entity.y === entity.targetY) {
      entity.targetX = undefined;
      entity.targetY = undefined;
    }

    const dx = (entity.targetX ?? entity.x) - entity.x;
    const dy = (entity.targetY ?? entity.y) - entity.y;
    const newX = entity.x + Math.sign(dx);
    const newY = entity.y + Math.sign(dy);

    return {
      x: Math.max(0, Math.min(this.gridWidth - 1, newX)),
      y: Math.max(0, Math.min(this.gridHeight - 1, newY)),
    };
  }

  private launchNewGrowth(entity: Entity): void {
    // Find random empty cell that's not occupied
    let targetX: number, targetY: number, attempts = 0;
    do {
      targetX = Math.floor(Math.random() * this.gridWidth);
      targetY = Math.floor(Math.random() * this.gridHeight);
      attempts++;
    } while (
      attempts < 10 &&
      (this.entities.some(e => e.x === targetX && e.y === targetY) ||
       this.entities.some(e => e.growingSquares?.some(g => g.x === targetX && g.y === targetY)))
    );

    if (attempts >= 10) return; // Couldn't find empty cell

    // Pick random emotion for new square
    const emotions = ['sad', 'neutral', 'angry', 'curious', 'excited'];
    const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const emotionToColor: { [key: string]: number } = {
      sad: 0x0000ff,
      neutral: 0xffff00,
      angry: 0xff0000,
      curious: 0x800080,
      excited: 0xff8000,
    };

    const growing: GrowingSquare = {
      x: targetX,
      y: targetY,
      sourceX: entity.x,
      sourceY: entity.y,
      emotion: randomEmotion,
      color: emotionToColor[randomEmotion],
      launchProgress: 0,
      growthProgress: 0,
      launchDuration: 1.0,
      growthDuration: 5.0,
    };

    // Create graphics for growing square
    growing.graphics = this.add.graphics();
    growing.label = this.add.text(0, 0, '', { font: 'bold 7px Arial', color: '#ffffff' });
    growing.label.setDepth(20);

    if (entity.growingSquares) {
      entity.growingSquares.push(growing);
    }
  }

  private drawGrowingSquare(growing: GrowingSquare): void {
    if (!growing.graphics) return;

    growing.graphics.clear();

    // Lerp position during launch phase
    let displayX = growing.sourceX;
    let displayY = growing.sourceY;
    let displaySize = 1; // In cells

    if (growing.launchProgress < 1) {
      // Launch animation: move from source to target
      displayX = growing.sourceX + (growing.x - growing.sourceX) * growing.launchProgress;
      displayY = growing.sourceY + (growing.y - growing.sourceY) * growing.launchProgress;
      displaySize = 0.2; // Small dot during launch
    } else {
      // Growth animation: grow from small to full size
      displayX = growing.x;
      displayY = growing.y;
      displaySize = 0.2 + (1 - 0.2) * growing.growthProgress; // 20% to 100%
    }

    // Convert to screen coordinates
    const x = this.padding + displayX * this.cellSize + (this.cellSize * (1 - displaySize)) / 2;
    const y = this.hudHeight + this.padding + displayY * this.cellSize + (this.cellSize * (1 - displaySize)) / 2;
    const size = this.cellSize * displaySize;

    // Draw square
    growing.graphics.fillStyle(growing.color);
    growing.graphics.fillRect(x, y, size, size);

    // Update label (show emotion need when grown enough)
    if (growing.label && displaySize > 0.5) {
      const emotionToNeed: { [key: string]: string } = {
        happy: 'REST',
        sad: 'FLEE',
        neutral: 'ROAM',
        angry: 'SEEK',
        curious: 'EXPLORE',
        excited: 'VISIT',
      };
      growing.label.setText(emotionToNeed[growing.emotion]);
      growing.label.setPosition(x + 1, y + 3);
      growing.label.setFontSize(Math.max(5, 7 * displaySize));
    }
  }

  private spawnFullyGrownEntity(growing: GrowingSquare): void {
    const emotionToNeed: { [key: string]: string } = {
      happy: 'REST',
      sad: 'FLEE',
      neutral: 'ROAM',
      angry: 'SEEK',
      curious: 'EXPLORE',
      excited: 'VISIT',
    };

    const newEntity: Entity = {
      x: growing.x,
      y: growing.y,
      visualX: growing.x,
      visualY: growing.y,
      originalColor: growing.color,
      currentColor: growing.color,
      emotion: growing.emotion,
      need: emotionToNeed[growing.emotion],
      blendProgress: -1,
      blendStartColor: growing.color,
      blendTargetColor: growing.color,
      blendDuration: this.blendDuration,
      moveTimer: 0,
      growingSquares: [],
    };

    // Create graphics and label
    const g = this.add.graphics();
    newEntity.graphics = g;
    const label = this.add.text(0, 0, newEntity.need, { font: 'bold 7px Arial', color: '#ffffff' });
    label.setDepth(20);
    newEntity.label = label;

    this.entities.push(newEntity);

    // Clean up growing square graphics
    if (growing.graphics) {
      growing.graphics.destroy();
    }
    if (growing.label) {
      growing.label.destroy();
    }
  }
}
