# Simple Exploration - Web Version

The first BigLittleEngine prototype as a web-based game using Phaser 3.

## What This Demonstrates

- 2D grid-based exploration in the browser
- Player movement using arrow keys (1 grid cell per second)
- Smooth animation between cells
- Performance metrics (FPS, move timer, input state)
- Web-first approach enabling automated testing and validation

## Quick Start

```bash
cd examples/simple_exploration_web
npm install
npm run dev
```

Open your browser to `http://localhost:5173` and start exploring!

## Controls

- **Arrow Keys**: Move up, down, left, right
- **Movement Speed**: 1 grid cell per second
- **Boundaries**: Player stops at grid edges

## The World

The grid contains:
- **You** (green square): The player character
- **5 colored entities**: Each represents an emotion (sad, neutral, angry, curious, excited)

## Build for Production

```bash
npm run build
npm run preview
```

## Technical Stack

- **Phaser 3**: 2D game framework
- **TypeScript**: Type-safe game logic
- **Vite**: Fast bundler and dev server
- **Canvas/WebGL**: Rendering

## Why Web-First?

This web version allows:
- Automated testing and validation (vs. native GUI)
- Easy sharing and deployment
- Cross-platform compatibility
- Faster iteration cycles
