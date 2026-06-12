# BigLittleEngine

A high-performance game engine designed for rapid iteration and discovery. BigLittleEngine prioritizes creating a stable, performant foundation that enables iterative game design—start with simple prototypes, test mechanics, iterate quickly, and throw away what doesn't work as you discover what's fun.

## Philosophy

Game development is exploration. BigLittleEngine separates the burden of engine infrastructure from the joy of game design. The engine provides a rock-solid, performant base so you can:

- **Start simple**: Write minimal game prototypes to test ideas quickly
- **Iterate fearlessly**: Throw away early prototypes—they're learning tools, not keepers
- **Find the fun**: Use the engine's speed and stability to focus on what makes a game engaging
- **Build on success**: Once you've discovered the core fun, expand on a proven foundation

This philosophy shapes every architectural decision: we optimize for iteration speed and clarity, not premature generality.

## Project Vision

BigLittleEngine is building a distributed game platform with three primary components:

- **Mac Client**: Native macOS application for local game development and play
- **Web Version**: Browser-based game client for accessible, cross-platform play
- **AWS Backend**: Scalable cloud infrastructure for multiplayer, persistence, and analytics

The engine itself (core game logic, simulation, rendering) will be written in **Rust** for performance and safety, with intentional integration points for platform-specific code (Swift for Mac, WebAssembly/TypeScript for web).

## Quick Start

*This section will be populated once the initial engine architecture is in place.*

### Prerequisites

- Rust 1.70+ (for engine development)
- macOS 12+ (for Mac client builds)
- Node.js 18+ (for web frontend, when applicable)
- AWS CLI configured (for backend deployments, when applicable)

### Installation & Running

*Coming soon: instructions for setting up the dev environment and running initial examples.*

## Project Structure

*The following structure is planned and will evolve as development progresses:*

```
BigLittleEngine/
├── engine/              # Core game engine (Rust)
│   ├── src/
│   │   ├── core/       # Fundamental systems (ECS, physics, rendering)
│   │   ├── math/       # Math utilities for game dev
│   │   └── lib.rs
│   └── Cargo.toml
│
├── mac-client/          # Native macOS application (Swift + Rust bindings)
│   ├── Sources/
│   ├── Package.swift
│   └── README.md
│
├── web/                 # Web client and frontend
│   ├── game/           # WebAssembly game code
│   ├── frontend/       # Web UI (TypeScript/React/Vue)
│   └── package.json
│
├── backend/             # AWS backend services (Rust/Node.js)
│   ├── services/       # Microservices for game logic, auth, persistence
│   ├── infra/          # Terraform/CDK for AWS infrastructure
│   └── Cargo.toml
│
├── examples/            # Example games and prototypes
│   ├── simple_2d/      # A minimal 2D game
│   ├── physics_demo/   # Physics system showcase
│   └── README.md       # Guidelines for example contributions
│
└── docs/                # Documentation and architecture guides
    ├── ARCHITECTURE.md
    ├── PHILOSOPHY.md
    └── CONTRIBUTING.md
```

## Technical Details

### Languages & Tech Stack

- **Core Engine**: Rust (performance, memory safety, fearless concurrency)
- **Mac Client**: Swift (native feel) + Rust FFI for engine integration
- **Web Client**: TypeScript/JavaScript, compiled engine code to WebAssembly
- **Backend**: Rust for performance-critical services, Node.js for rapid iteration where appropriate
- **Infrastructure**: Terraform/AWS CDK for IaC on AWS

### Performance Focus

- Engine designed for 60+ FPS on target hardware
- Minimal allocations in hot paths
- Efficient serialization for network communication
- Optimized entity-component-system (ECS) for game logic

### Key Architectural Principles

1. **Engine as a library**: Core game logic decoupled from platform concerns
2. **Clear boundaries**: Well-defined FFI layers between Rust and platform code
3. **Iterative-first**: Prioritize fast feedback loops over perfect architecture
4. **Observable**: Logging and metrics baked in from the start

## Contributing

We welcome contributions at all levels:

- **Throwaway prototypes**: Have an idea for a simple game? Create a new example in `examples/` and iterate on it. These are intentionally disposable.
- **Engine improvements**: Performance optimizations, new systems, or API improvements to core engine code
- **Platform code**: Mac client features, web frontend improvements, backend services
- **Documentation**: Guides, tutorials, architecture docs

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines (coming soon).

### Starting a New Game Prototype

1. Create a new directory in `examples/`
2. Use the engine as a dependency
3. Iterate quickly—this is your sandbox
4. When it stops being fun, move on or refactor into something new

## Roadmap & Status

### Phase 1: Foundation (Current)
- [ ] Initialize core engine structure in Rust
- [ ] Basic rendering pipeline (2D or 3D as starting point)
- [ ] Entity-component-system framework
- [ ] Example game #1 (simple, throwaway prototype)
- [ ] GitHub repository setup & CI/CD

### Phase 2: Platform Integration (Q3 2026)
- [ ] Mac client scaffolding (Swift + Rust bindings)
- [ ] Web client scaffolding (TypeScript + WebAssembly)
- [ ] Basic backend service structure on AWS

### Phase 3: Iteration & Discovery (Q4 2026+)
- [ ] Multiple example games using the engine
- [ ] Real multiplayer backend services
- [ ] Performance optimizations based on real-world usage
- [ ] Expanded documentation and tutorials

## License

MIT License – see LICENSE file for details.

## Resources

- [Rust Book](https://doc.rust-lang.org/book/) – Language reference
- [ECS Pattern](https://en.wikipedia.org/wiki/Entity_component_system) – Architectural pattern used in the engine
- [Game Development Patterns](https://gameprogrammingpatterns.com/) – Design patterns for game dev

---

**Status**: Early-stage vision document. Code coming soon.
