# 🎄 3D Christmas Tree with Three.js

An interactive, high-performance 3D Christmas Tree built with Three.js, featuring metallic PBR materials, dynamic transitions, and background music.

![Recording of the Christmas Tree](file:///home/tishan/.gemini/antigravity/brain/022c9d45-f611-43eb-af28-f5954590d270/verify_tree_app_1766691561796.webp)

## ✨ Features

*   **Interactive 3D Scene**: Use your mouse to explore the festive environment.
*   **Performance Optimized**: Utilizes `THREE.InstancedMesh` to render thousands of geometries (Spheres and Cubes) smoothly at a high frame rate.
*   **Metallic PBR Materials**: Geometries feature realistic golden and red reflections, creating a premium "Christmas ornament" look.
*   **Dynamic Transitions**:
    *   **Click to Scatter**: Watch the tree explode into a cloud of festive particles.
    *   **Click to Message**: The particles gather to form a "MERRY CHRISTMAS" text layout.
    *   **Click to Reset**: Return the particles back to the Christmas tree shape.
*   **Mouse Interaction**: Drag to rotate the scene and view the tree from any angle.
*   **Automated Animation**: Subtle auto-rotation for a more dynamic and artistic feel.
*   **Background Music**: Automatically plays festive background music (requires user interaction to start due to browser policies).

## 🚀 Getting Started

### Prerequisites

*   Node.js (v14 or later)
*   npm (or yarn/pnpm)

### Installation

1.  Clone the repository:
    ```bash
    git clone [repository-url]
    cd christmas-tree
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the development server:
    ```bash
    npm run dev
    ```

4.  Open your browser and navigate to `http://localhost:5173`.

## 🛠️ Built With

*   [Three.js](https://threejs.org/) - 3D Engine
*   [GSAP](https://greensock.com/gsap/) - Animation Library
*   [Vite](https://vitejs.dev/) - Frontend Tooling
*   Vanilla CSS & HTML

## 🎨 Visual Style

*   **Tree Shape**: A conical spiral of spheres and cubes.
*   **Topper**: A glowing yellow octahedron.
*   **Colors**: A palette of Gold, Rich Gold, Christmas Red, and Deep Green.
*   **Typography**: Serif font 'Playfair Display' for a classic festive look.

---

Made with ❤️ and a lot of holiday spirit! 🎄✨
