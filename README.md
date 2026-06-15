# 🌌 Astro Dash

Astro Dash is a visually immersive 3D endless runner set in deep space. Play as a tiny alien trying to make it back to your spaceship by dashing across procedurally generated platforms, dodging gaps, and avoiding falling into the void.

Built with **JavaScript** and **Three.js**, this game blends arcade fun with 3D physics and a dynamic environment.

---

## 🎮 How to Play

- **Move** using `W`, `A`, `S`, `D` or Arrow keys
- **Jump** with `Spacebar`
- **Pause/Unpause** with `P`
- Avoid falling through holes or off walls
- Run as far as you can to rack up your score!

---

## 🧠 Game Features

- 🛸 **Procedural Level Design**: Randomized platforms, walls, and ceilings with hole patterns.
- 🌠 **3D Starfield**: Realistic galaxy-inspired background using particle systems.
- 🦾 **Alien Avatar with Limbs & Antennas**: Fully animated character using matrix transformations.
- 🎶 **Background Music**: Spatial audio for enhanced immersion (`assets/bgm.mp3`).
- 🎥 **Dynamic Camera System**: Smooth camera transitions based on player's movement and position.
- 🔁 **Multi-Surface Gameplay**: Run on floors, walls, or ceilings — gravity adjusts dynamically!
- 🌈 **Color-Switching Effects**: Scene visuals change every few seconds to keep the challenge fresh.
- 💥 **Fail State & Reset**: Fall detection with respawn logic if you miss a platform.

---

## 📦 Installation & Running

No build steps needed. Just:

1. Clone or download the project.
2. Open `index.html` in any modern browser (Chrome, Firefox, Edge).
3. Make sure the `assets/` folder (with `bgm.mp3`) is in the same directory.

```bash
git clone https://github.com/your-username/astro-dash.git
cd astro-dash
open index.html
