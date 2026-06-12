import Phaser from 'phaser';
import ExplorationScene from './scenes/ExplorationScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 600,
  height: 650,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    },
  },
  scene: [ExplorationScene],
};

const game = new Phaser.Game(config);
