# Simple Exploration

The first BigLittleEngine prototype: a minimal 2D grid-based exploration game.

## What This Demonstrates

- Basic 2D grid rendering with visible cell boundaries
- Player movement using arrow keys (1 grid cell per second)
- Multiple colored entities representing different emotions
- Clear visual distinction for the player character
- Simple, throwaway prototype validating core movement mechanics

## How to Run

```bash
cd examples/simple_exploration
cargo run
```

The game window will open with a 10x10 grid. You (the green square with "YOU" label) start in the center.

## Controls

- **Arrow Keys**: Move up, down, left, right
- **Movement Speed**: 1 grid cell per second
- **Boundaries**: Player stops at grid edges

## The World

The grid contains:
- **You** (green): The player character
- **Sad entity** (blue): At (1, 1)
- **Neutral entity** (yellow): At (8, 2)
- **Angry entity** (red): At (3, 7)
- **Curious entity** (purple): At (7, 8)
- **Excited entity** (orange): At (5, 2)

Each colored square represents an abstract entity with an emotion. This prototype is purely observational—no interaction mechanics yet.

## Future Iterations

- Interaction mechanics (moving into/affecting other entities)
- Entity behavior and state changes
- More complex world dynamics
- Integration with the core engine

## Technical Notes

- Built with [macroquad](https://github.com/not-fl3/macroquad) for cross-platform simplicity
- Single-threaded game loop with fixed timestep movement
- Grid-based discrete movement (each press queues a move, executed when the timer fires)
