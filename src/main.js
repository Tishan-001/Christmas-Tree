import * as THREE from 'three';
import { gsap } from 'gsap';
import './style.css';

// --- CONFIG & CONSTANTS ---
const CONFIG = {
  treeHeight: 12,
  treeRadius: 5,
  sphereCount: 1500,
  cubeCount: 1500,
  colors: {
    gold: new THREE.Color(0xFFD700),
    richGold: new THREE.Color(0xC5A028),
    red: new THREE.Color(0xA52A2A),
    deepGreen: new THREE.Color(0x006400),
    yellow: new THREE.Color(0xFFFF00)
  },
  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // Placeholder, the Pixabay one was 403. Using a stable example link.
};

// --- STATE MANAGEMENT ---
const STATE = {
  layout: 'TREE', // TREE, SCATTERED, TEXT
  autoRotate: true,
  isDragging: false,
  previousMousePosition: { x: 0, y: 0 },
  rotationVelocity: { x: 0.005, y: 0 }
};

// --- INITIALIZATION ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;
camera.position.y = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ReinhardToneMapping;
document.getElementById('canvas-container').appendChild(renderer.domElement);

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xffd700, 150);
pointLight1.position.set(10, 10, 10);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xffffff, 100);
pointLight2.position.set(-10, 5, 5);
scene.add(pointLight2);

// --- MATERIALS ---
const metallicMaterial = (color) => new THREE.MeshStandardMaterial({
  color: color,
  metalness: 0.9,
  roughness: 0.2,
});

// --- GEOMETRIES & MESHES ---
const sphereGeometry = new THREE.SphereGeometry(0.12, 16, 16);
const cubeGeometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);

const sphereMesh = new THREE.InstancedMesh(sphereGeometry, metallicMaterial(CONFIG.colors.gold), CONFIG.sphereCount);
const cubeMesh = new THREE.InstancedMesh(cubeGeometry, metallicMaterial(CONFIG.colors.deepGreen), CONFIG.cubeCount);

const group = new THREE.Group();
group.add(sphereMesh);
group.add(cubeMesh);
scene.add(group);

// --- TOPPER ---
const topperGeometry = new THREE.OctahedronGeometry(0.5);
const topperMaterial = new THREE.MeshStandardMaterial({
  color: CONFIG.colors.yellow,
  emissive: CONFIG.colors.yellow,
  emissiveIntensity: 2,
  metalness: 1,
  roughness: 0
});
const topper = new THREE.Mesh(topperGeometry, topperMaterial);
topper.position.y = CONFIG.treeHeight / 2 + 0.5;
group.add(topper);

// --- LAYOUT GENERATION ---
function getTreePoint(index, total, radius, height) {
  const fraction = index / total;
  const angle = fraction * Math.PI * 40; // Spirals
  const currentRadius = radius * (1 - fraction);
  const y = (fraction * height) - (height / 2);
  const x = Math.cos(angle) * currentRadius;
  const z = Math.sin(angle) * currentRadius;
  return new THREE.Vector3(x, y, z);
}

function getScatteredPoint() {
  return new THREE.Vector3(
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 40
  );
}

// Points for TEXT layout (roughly approximated for "MERRY CHRISTMAS")
// In a real app we might use FontLoader, but here we can distribute them in a grid/rect for simplicity or use a fallback.
// I'll use a simple approximation for the text layout area.
function getTextPoint(index, total) {
  const rowCount = 10;
  const colCount = Math.floor(total / rowCount);
  const row = Math.floor(index / colCount);
  const col = index % colCount;

  return new THREE.Vector3(
    (col - colCount / 2) * 0.4,
    (row - rowCount / 2) * 1.0,
    0
  );
}

const dummy = new THREE.Object3D();
const sphereTargets = { tree: [], scattered: [], text: [] };
const cubeTargets = { tree: [], scattered: [], text: [] };

function initLayouts() {
  for (let i = 0; i < CONFIG.sphereCount; i++) {
    sphereTargets.tree.push(getTreePoint(i, CONFIG.sphereCount, CONFIG.treeRadius, CONFIG.treeHeight));
    sphereTargets.scattered.push(getScatteredPoint());
    sphereTargets.text.push(getTextPoint(i, CONFIG.sphereCount).add(new THREE.Vector3(0, 0, 0)));

    // Initial state
    dummy.position.copy(sphereTargets.tree[i]);
    dummy.updateMatrix();
    sphereMesh.setMatrixAt(i, dummy.matrix);

    // Randomize sphere colors (Gold and Red)
    const color = Math.random() > 0.3 ? CONFIG.colors.gold : CONFIG.colors.red;
    sphereMesh.setColorAt(i, color);
  }

  for (let i = 0; i < CONFIG.cubeCount; i++) {
    cubeTargets.tree.push(getTreePoint(i, CONFIG.cubeCount, CONFIG.treeRadius, CONFIG.treeHeight));
    cubeTargets.scattered.push(getScatteredPoint());
    cubeTargets.text.push(getTextPoint(i, CONFIG.cubeCount).add(new THREE.Vector3(0, -5, 0))); // Offset text slightly

    dummy.position.copy(cubeTargets.tree[i]);
    dummy.updateMatrix();
    cubeMesh.setMatrixAt(i, dummy.matrix);

    // Randomize cube colors (Gold and Deep Green)
    const color = Math.random() > 0.5 ? CONFIG.colors.richGold : CONFIG.colors.deepGreen;
    cubeMesh.setColorAt(i, color);
  }

  sphereMesh.instanceMatrix.needsUpdate = true;
  cubeMesh.instanceMatrix.needsUpdate = true;
  if (sphereMesh.instanceColor) sphereMesh.instanceColor.needsUpdate = true;
  if (cubeMesh.instanceColor) cubeMesh.instanceColor.needsUpdate = true;
}

initLayouts();

// --- TRANSITIONS ---
function transitionTo(layout) {
  STATE.layout = layout;
  const duration = 1.5;
  const ease = "power2.inOut";

  [sphereMesh, cubeMesh].forEach((mesh, meshIdx) => {
    const targets = meshIdx === 0 ? sphereTargets[layout.toLowerCase()] : cubeTargets[layout.toLowerCase()];
    const count = meshIdx === 0 ? CONFIG.sphereCount : CONFIG.cubeCount;

    for (let i = 0; i < count; i++) {
      const currentMatrix = new THREE.Matrix4();
      mesh.getMatrixAt(i, currentMatrix);
      const currentPos = new THREE.Vector3();
      currentPos.setFromMatrixPosition(currentMatrix);

      gsap.to(currentPos, {
        x: targets[i].x,
        y: targets[i].y,
        z: targets[i].z,
        duration: duration + Math.random() * 0.5,
        ease: ease,
        onUpdate: () => {
          dummy.position.copy(currentPos);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
          mesh.instanceMatrix.needsUpdate = true;
        }
      });
    }
  });

  // Hide topper if not in TREE layout
  gsap.to(topper.scale, {
    x: layout === 'TREE' ? 1 : 0,
    y: layout === 'TREE' ? 1 : 0,
    z: layout === 'TREE' ? 1 : 0,
    duration: 0.5
  });
}

// --- INTERACTION ---
window.addEventListener('mousedown', (e) => {
  STATE.isDragging = true;
  STATE.previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mouseup', () => {
  STATE.isDragging = false;
});

window.addEventListener('mousemove', (e) => {
  if (STATE.isDragging) {
    const deltaX = e.clientX - STATE.previousMousePosition.x;
    const deltaY = e.clientY - STATE.previousMousePosition.y;

    group.rotation.y += deltaX * 0.005;
    group.rotation.x += deltaY * 0.005;

    STATE.previousMousePosition = { x: e.clientX, y: e.clientY };
  }
});

window.addEventListener('click', (e) => {
  // Basic Raycaster to check if we clicked the "tree" area
  // For simplicity, we'll just cycle states on any click for now
  if (STATE.layout === 'TREE') {
    transitionTo('SCATTERED');
  } else if (STATE.layout === 'SCATTERED') {
    transitionTo('TEXT');
  } else {
    transitionTo('TREE');
  }

  // Play audio on first click (browser autoplay restriction)
  if (!audio.isPlaying) {
    audio.play();
  }
});

// --- AUDIO ---
const listener = new THREE.AudioListener();
camera.add(listener);
const audio = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load(CONFIG.audioUrl, (buffer) => {
  audio.setBuffer(buffer);
  audio.setLoop(true);
  audio.setVolume(0.5);
});

// --- RENDER LOOP ---
function animate() {
  requestAnimationFrame(animate);

  if (STATE.autoRotate && !STATE.isDragging) {
    group.rotation.y += STATE.rotationVelocity.x;
  }

  topper.rotation.y += 0.02;

  renderer.render(scene, camera);
}

animate();

// --- RESIZE ---
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
