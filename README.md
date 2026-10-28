# CAUSALITY - THE BUTTERFLY EFFECT ENGINE

CAUSALITY is a web-based, interactive deterministic simulation engine exploring the butterfly effect.

It allows users to simulate a fictional micro-world (with citizens, businesses, and infrastructure) and introduce singular events—like a power outage, business closure, or unexpected worker absence—and observe the deterministic cascading consequences on the ecosystem.

## Features Implemented
1. **Working Deterministic Simulation Engine**: Uses a tick-based system and seeded pseudorandom number generator to explicitly compute actions and ripple effects (e.g. business closures causing job loss).
2. **Interactive Event Injection**: A matrix allowing users to trigger specific events at targeted entities or city-wide.
3. **Causal Event Graph**: Visualizes the explicit chain of causes and effects using React Flow.
4. **Timeline Branching**: Allows pausing the simulation and forking a new timeline to explore alternative decisions.
5. **Side-by-side Comparison**: Split Universe view to compare Prime and Branch timelines simultaneously.
6. **Replay Functionality**: Time scrubber to jump to specific points in history and step backward/forward.
7. **UI Polish**: Beautiful glass-morphic dark neon user interface.

## Tech Stack
- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- Zustand (State management)
- React Flow (Network visualization)
- Vitest (Testing)

## Getting Started

1. Install dependencies:
   ```sh
   npm install
   ```
2. Run development server:
   ```sh
   npm run dev
   ```
3. Run tests:
   ```sh
   npm test
   ```
4. Build for production:
   ```sh
   npm run build
   ```

## Deployment
The repository includes a GitHub Actions workflow configured to automatically build and test the project, and deploy the production build to GitHub Pages on pushes to the `main` branch.

## Known Limitations
- Causal Graph is currently unified by timeline rather than visually bifurcating; viewing history requires switching between active timelines.
- Economy modeling is simplified and bounded to prevent infinite state space expansion (simulated limit: 100 agents, 5 businesses).
