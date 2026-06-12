import Phaser from 'phaser';
import ExplorationScene from './scenes/ExplorationScene';
const config = {
    type: Phaser.AUTO,
    parent: 'game',
    width: 450,
    height: 500,
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
