import Phaser from 'phaser';
import ExplorationScene from './scenes/ExplorationScene';
const config = {
    type: Phaser.AUTO,
    parent: 'game',
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.EXPAND,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,
        expandParent: true,
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
        },
    },
    scene: [ExplorationScene],
};
const game = new Phaser.Game(config);
