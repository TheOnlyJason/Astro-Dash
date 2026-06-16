import * as THREE from 'three';

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const listener = new THREE.AudioListener();
camera.add(listener);
const backgroundMusic = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();

audioLoader.load('assets/bgm.mp3', (buffer) => {
  backgroundMusic.setBuffer(buffer);
  backgroundMusic.setLoop(true);
  backgroundMusic.setVolume(0.05);
});

function playCoinUpSound() {
  const ctx = listener.context;
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(988, now);
  osc.frequency.exponentialRampToValueAtTime(1319, now + 0.06);
  osc.frequency.exponentialRampToValueAtTime(1568, now + 0.12);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.35);
}

// Function to create a starfield
function createStarfield() {
  const starCount = 5000; // Number of stars
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5 });

  // Create an array to hold star positions
  const starVertices = [];
  for (let i = 0; i < starCount; i++) {
    const x = THREE.MathUtils.randFloatSpread(1000); // Random position within a 1000-unit cube
    const y = THREE.MathUtils.randFloatSpread(1000);
    const z = THREE.MathUtils.randFloatSpread(1000);
    starVertices.push(x, y, z);
  }

  // Set star positions to the geometry
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

  // Create Points mesh
  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
  return stars;
}

const starfield = createStarfield();

function createForegroundStars() {
  const starCount = 120;
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({
    color: 0xbbddff,
    size: 2.2,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });

  const starVertices = [];
  for (let i = 0; i < starCount; i++) {
    starVertices.push(
      THREE.MathUtils.randFloatSpread(28),
      THREE.MathUtils.randFloatSpread(16),
      THREE.MathUtils.randFloat(2, 14)
    );
  }

  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  const foregroundStars = new THREE.Points(starGeometry, starMaterial);
  scene.add(foregroundStars);
  return foregroundStars;
}

const foregroundStars = createForegroundStars();



const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x05060a); // Deep space backdrop

// Soft ambient + hemisphere lighting so the laboratory surface textures read
// even away from the alien's own point light.
const labAmbient = new THREE.AmbientLight(0x8294a8, 0.16);
scene.add(labAmbient);
const labHemisphere = new THREE.HemisphereLight(0xaebfd2, 0x20262f, 0.16);
scene.add(labHemisphere);
// Soft overhead fill so the whole corridor is visible (and gives gentle shadows).
const labFill = new THREE.DirectionalLight(0xdfe8f2, 0.12);
labFill.position.set(6, 20, 8);
scene.add(labFill);

// Laboratory metal-panel textures (CC0, Poly Haven) loaded from public/textures.
const textureLoader = new THREE.TextureLoader();
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

function loadSurfaceTextures(asset, repeatX, repeatY) {
  const make = (map, isColor) => {
    const tex = textureLoader.load(`textures/${asset}_${map}.jpg`);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = maxAnisotropy;
    if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
  return {
    map: make('diff', true),
    normalMap: make('nor_gl', false),
    roughnessMap: make('rough', false),
    metalnessMap: make('metal', false),
  };
}

// Organic skin texture (CC0, Poly Haven) for the alien body and limbs.
function loadAlienSkin(repeatX, repeatY) {
  const make = (map, isColor) => {
    const tex = textureLoader.load(`textures/alien_skin_${map}.jpg`);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    tex.anisotropy = maxAnisotropy;
    if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  };
  return {
    map: make('diff', true),
    normalMap: make('nor_gl', false),
    roughnessMap: make('rough', false),
  };
}

function translationMatrix(tx, ty, tz) {
  return new THREE.Matrix4().set(
    1, 0, 0, tx,
    0, 1, 0, ty,
    0, 0, 1, tz,
    0, 0, 0, 1
  );
}

function rotationMatrixX(theta) {
  return new THREE.Matrix4().set(
    1, 0, 0, 0,
    0, Math.cos(theta), -Math.sin(theta), 0,
    0, Math.sin(theta), Math.cos(theta), 0,
    0, 0, 0, 1
  );
}

function rotationMatrixY(theta) {
  return new THREE.Matrix4().set(
    Math.cos(theta), 0, Math.sin(theta), 0,
    0, 1, 0, 0,
    -Math.sin(theta), 0, Math.cos(theta), 0,
    0, 0, 0, 1
  );
}

function rotationMatrixZ(theta) {
  return new THREE.Matrix4().set(
    Math.cos(theta), -Math.sin(theta), 0, 0,
    Math.sin(theta), Math.cos(theta), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
  );
}

// Create player
const ALIEN_GRAY = 0x9aa1ab;
const playerGeometry = new THREE.SphereGeometry(0.5, 48, 32);
const playerMaterial = new THREE.MeshStandardMaterial({
  ...loadAlienSkin(3, 2),
  color: ALIEN_GRAY,
  roughness: 1.0,
  metalness: 0.0,
  normalScale: new THREE.Vector2(0.8, 0.8),
  emissive: 0x12241c,
  emissiveIntensity: 0.5,
  flatShading: false,
});
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.castShadow = true;
player.receiveShadow = true;
scene.add(player);

const playerGlow = new THREE.Mesh(
  new THREE.SphereGeometry(0.9, 32, 24),
  new THREE.MeshBasicMaterial({ color: 0x6effb0, transparent: true, opacity: 0.22 })
);
player.add(playerGlow);

player.position.y = 1; // Start above the ground

let leftArm, rightArm, leftLeg, rightLeg, leftAntenna, rightAntenna;

// Function to add arms, legs, and antennas to the player
function addCharacterParts() {
  // Arm geometry and material (capsule = rounded ends, no hard cylinder rims)
  const armGeometry = new THREE.CapsuleGeometry(0.1, 0.12, 12, 24);
  const armMaterial = new THREE.MeshStandardMaterial({ ...loadAlienSkin(1, 2), color: ALIEN_GRAY, roughness: 1.0, metalness: 0.0, flatShading: false });

  // Left Arm
  leftArm = new THREE.Mesh(armGeometry, armMaterial);
  leftArm.position.set(-0.5, 0.1, 0); // Positioned to the left side of the body
  leftArm.rotation.z = Math.PI / 4;
  player.add(leftArm);

  // Right Arm
  rightArm = new THREE.Mesh(armGeometry, armMaterial);
  rightArm.position.set(0.5, 0.1, 0); // Positioned to the right side of the body
  rightArm.rotation.z = -Math.PI / 4;
  player.add(rightArm);

  // Leg geometry and material (capsule = rounded ends, no hard cylinder rims)
  const legGeometry = new THREE.CapsuleGeometry(0.15, 0.2, 12, 24);
  const legMaterial = new THREE.MeshStandardMaterial({ ...loadAlienSkin(1, 2), color: ALIEN_GRAY, roughness: 1.0, metalness: 0.0, flatShading: false });

  // Left Leg
  leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.3, -0.5, 0); // Positioned below and to the left
  player.add(leftLeg);

  // Right Leg
  rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.3, -0.5, 0); // Positioned below and to the right
  player.add(rightLeg);

  // Antenna geometry and material
  const antennaGeometry = new THREE.CapsuleGeometry(0.04, 0.22, 8, 16);
  const antennaMaterial = new THREE.MeshStandardMaterial({ color: 0x6f7680, roughness: 0.6, metalness: 0.2, flatShading: false });

  // Left Antenna
  leftAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
  leftAntenna.position.set(-0.2, 0.5, 0); // Positioned above and to the left
  leftAntenna.rotation.z = Math.PI / 6;
  player.add(leftAntenna);

  // Right Antenna
  rightAntenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
  rightAntenna.position.set(0.2, 0.5, 0); // Positioned above and to the right
  rightAntenna.rotation.z = -Math.PI / 6;
  player.add(rightAntenna);

  // Small sphere at the end of each antenna
  const antennaTipGeometry = new THREE.SphereGeometry(0.1, 24, 16);
  const antennaTipMaterial = new THREE.MeshStandardMaterial({
    color: 0xb6bcc6,
    roughness: 0.5,
    metalness: 0.2,
    emissive: 0x1c3a2a,
    emissiveIntensity: 0.7,
  });

  // Left Antenna Tip
  const leftAntennaTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial);
  leftAntennaTip.position.set(0, 0.2, 0);
  leftAntenna.add(leftAntennaTip);

  // Right Antenna Tip
  const rightAntennaTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial);
  rightAntennaTip.position.set(0, 0.2, 0);
  rightAntenna.add(rightAntennaTip);

  [leftArm, rightArm, leftLeg, rightLeg, leftAntenna, rightAntenna,
    leftAntennaTip, rightAntennaTip].forEach((part) => {
      part.castShadow = true;
      part.receiveShadow = true;
    });
}

// Call the function to add character parts to the player
addCharacterParts();



const platformMaterial = new THREE.MeshStandardMaterial({
  ...loadSurfaceTextures('metal_plate_02', 4, 4),
  color: 0xb4bcc6,          // Cool steel tint for the lab floor
  metalness: 0.45,
  roughness: 0.85,
});

const TUNNEL_WIDTH = 15;
const TUNNEL_HEIGHT = 15;
const TUNNEL_DEPTH = 15;
const TUNNEL_HALF_WIDTH = TUNNEL_WIDTH / 2;
const PANEL_THICKNESS = 0.1;
const WALL_THICKNESS = 0.1;
const PLAYER_RADIUS = 0.5;
const WALL_INNER_X = TUNNEL_HALF_WIDTH - WALL_THICKNESS / 2;
// Leg bottoms sit at local y=-0.75; after ±90° wall rotation that is 0.75 toward the wall
const FEET_WALL_OFFSET = 0.75;
const PLAYER_MAX_X = WALL_INNER_X - FEET_WALL_OFFSET;
const PLAYER_MIN_X = -PLAYER_MAX_X;
const FLOOR_ATTACH_Y = 1;

// --- Polygon tunnel (radial movement) ---
const APOTHEM = TUNNEL_HALF_WIDTH;          // center-to-face distance (7.5)
const CENTER_Y = TUNNEL_HEIGHT / 2;         // tunnel axis height (7.5) -> floor at y=0
const STAND_OFFSET = 1;                     // player center sits this far above a face
const MOVE_LINEAR = 0.12;                   // linear walk speed around the tube
const OUT_OF_BOUNDS = 7;                    // hClear below -this => fell out, reset
const SHAPE_ZONE_LENGTH = 40;               // segments before the shape changes
const TUNNEL_SHAPES = [4];                  // square tunnel — clearer walls, wider floor

function getTunnelSides(index) {
  const zone = Math.floor(index / SHAPE_ZONE_LENGTH) % TUNNEL_SHAPES.length;
  return TUNNEL_SHAPES[zone];
}

const TOTAL_SEGMENTS = Math.floor(1000 / TUNNEL_DEPTH) + 1;
const GRACE_PROGRESS = 0.10;

function getSegmentProgress(segmentIndex) {
  if (TOTAL_SEGMENTS <= 1) return 1;
  return Math.min(1, segmentIndex / (TOTAL_SEGMENTS - 1));
}

function getFloorHoleSize(progress) {
  if (progress < GRACE_PROGRESS) return 0;
  const t = (progress - GRACE_PROGRESS) / (1 - GRACE_PROGRESS);
  const eased = t * t;
  const min = 3;
  const max = 8;
  const jitter = (Math.random() - 0.5) * 1.2;
  return Math.max(min, Math.min(max, Math.round(THREE.MathUtils.lerp(min, max, eased) + jitter)));
}

// Forward gaps on the floor (along -Z) that the player must jump over.
function makeFloorZHole(progress, sideLen) {
  const hw = getFloorHoleSize(progress);
  if (hw <= 0) return null;
  const hxw = Math.min(hw, sideLen * 0.55);
  const maxZ = (TUNNEL_DEPTH - hw) / 2;
  const maxX = (sideLen - hxw) / 2;
  const hz = THREE.MathUtils.randFloat(-maxZ, maxZ);
  // Bias toward the center of the floor so holes sit in the running lane.
  const hx = THREE.MathUtils.randFloatSpread(maxX * 0.5);
  return { hx, hz, hw, hxw };
}

function buildFloorFace(seg, faceCenter, sideLen, zHole, material) {
  const faceGroup = new THREE.Group();
  faceGroup.position.set(Math.sin(faceCenter) * APOTHEM, CENTER_Y - Math.cos(faceCenter) * APOTHEM, 0);
  faceGroup.rotation.z = faceCenter;

  const addPanel = (width, depth, offsetX, offsetZ) => {
    if (width <= 0.001 || depth <= 0.001) return;
    const m = new THREE.Mesh(new THREE.BoxGeometry(width, PANEL_THICKNESS, depth), material);
    m.position.set(offsetX, 0, offsetZ);
    faceGroup.add(m);
  };

  if (!zHole) {
    addPanel(sideLen, TUNNEL_DEPTH, 0, 0);
  } else {
    const { hx, hz, hw, hxw } = zHole;
    const halfLen = sideLen / 2;
    const halfDepth = TUNNEL_DEPTH / 2;

    if (hx - hxw / 2 > -halfLen) {
      const leftW = hx - hxw / 2 + halfLen;
      addPanel(leftW, TUNNEL_DEPTH, -halfLen + leftW / 2, 0);
    }
    if (hx + hxw / 2 < halfLen) {
      const rightW = halfLen - hx - hxw / 2;
      addPanel(rightW, TUNNEL_DEPTH, halfLen - rightW / 2, 0);
    }
    if (hz - hw / 2 > -halfDepth) {
      const frontD = hz - hw / 2 + halfDepth;
      addPanel(hxw, frontD, hx, halfDepth - frontD / 2);
    }
    if (hz + hw / 2 < halfDepth) {
      const backD = halfDepth - hz - hw / 2;
      addPanel(hxw, backD, hx, -halfDepth + backD / 2);
    }
  }
  seg.add(faceGroup);
}

function getWallHoleSize(progress) {
  if (progress < GRACE_PROGRESS) return 0;
  const t = (progress - GRACE_PROGRESS) / (1 - GRACE_PROGRESS);
  return Math.round(THREE.MathUtils.lerp(3, 6, t * t));
}

function getWallHoleChance(progress) {
  if (progress < GRACE_PROGRESS) return 0;
  const t = (progress - GRACE_PROGRESS) / (1 - GRACE_PROGRESS);
  return THREE.MathUtils.lerp(0.25, 1, t * t);
}

function enableShadows(obj) {
  obj.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return obj;
}

// Build one prism slice of the polygon tunnel at world z. The cross-section is
// a regular polygon with `sides` faces; one face is always centered at the
// bottom (theta = 0) so the floor stays consistent when the shape changes.
function makeFaceHole(progress, sideLen) {
  const chance = getWallHoleChance(progress);
  if (Math.random() >= chance) return null;
  let hw = getWallHoleSize(progress);
  hw = Math.min(hw, sideLen * 0.7);
  if (hw <= 0) return null;
  const maxOffset = (sideLen - hw) / 2;
  const hx = THREE.MathUtils.randFloat(-maxOffset, maxOffset);
  return { hx, hw };
}

function buildFace(seg, faceCenter, sideLen, hole, material) {
  const faceGroup = new THREE.Group();
  faceGroup.position.set(Math.sin(faceCenter) * APOTHEM, CENTER_Y - Math.cos(faceCenter) * APOTHEM, 0);
  faceGroup.rotation.z = faceCenter;

  const addPanel = (width, offsetX) => {
    if (width <= 0.001) return;
    const m = new THREE.Mesh(new THREE.BoxGeometry(width, PANEL_THICKNESS, TUNNEL_DEPTH), material);
    m.position.set(offsetX, 0, 0);
    faceGroup.add(m);
  };

  if (!hole) {
    addPanel(sideLen, 0);
  } else {
    const left = -sideLen / 2;
    const right = sideLen / 2;
    const holeL = hole.hx - hole.hw / 2;
    const holeR = hole.hx + hole.hw / 2;
    if (holeL > left) addPanel(holeL - left, (left + holeL) / 2);
    if (holeR < right) addPanel(right - holeR, (right + holeR) / 2);
  }
  seg.add(faceGroup);
}

function createSegment(z, index) {
  const progress = getSegmentProgress(index);
  const sides = getTunnelSides(index);
  const faceStep = (Math.PI * 2) / sides;
  const sideLen = 2 * APOTHEM * Math.tan(Math.PI / sides);

  const seg = new THREE.Group();
  seg.position.set(0, 0, z);

  const faces = [];
  for (let k = 0; k < sides; k++) {
    const faceCenter = k * faceStep;
    if (k === 0) {
      const zHole = makeFloorZHole(progress, sideLen);
      buildFloorFace(seg, faceCenter, sideLen, zHole, platformMaterial);
      faces.push({ hole: null, zHole });
    } else {
      const hole = makeFaceHole(progress, sideLen);
      buildFace(seg, faceCenter, sideLen, hole, wallMaterial);
      faces.push({ hole, zHole: null });
    }
  }

  enableShadows(seg);
  scene.add(seg);
  return { z, group: seg, sides, faceStep, sideLen, faces };
}


const wallMaterial = new THREE.MeshStandardMaterial({
  ...loadSurfaceTextures('metal_plate', 3, 3),
  color: 0xaab4c0,          // Brushed-steel lab wall panels
  metalness: 0.45,
  roughness: 0.85,
});


// Flashlight: a spotlight mounted just above/behind the alien (in his local
// frame) aimed forward (-Z) so it lights the path ahead and casts his shadow.
const playerLight = new THREE.SpotLight(0xffffff, 12, 65, Math.PI / 3.2, 0.45, 1.25);
playerLight.position.set(0, 1.2, 1.4);
playerLight.castShadow = true;
playerLight.shadow.mapSize.set(1024, 1024);
playerLight.shadow.camera.near = 0.5;
playerLight.shadow.camera.far = 50;
playerLight.shadow.bias = -0.0004;
player.add(playerLight);

const playerLightTarget = new THREE.Object3D();
playerLightTarget.position.set(0, -0.6, -20); // forward and slightly down
player.add(playerLightTarget);
playerLight.target = playerLightTarget;




const roofMaterial = new THREE.MeshStandardMaterial({
  ...loadSurfaceTextures('metal_plate', 3, 3),
  color: 0x97a1ad,          // Slightly darker ceiling panels
  metalness: 0.45,
  roughness: 0.85,
  side: THREE.DoubleSide,
});



// --- Endless polygon tunnel streaming ---
// Segments are generated ahead of the player and recycled once well behind,
// so the corridor never ends and there is no empty void to run into.
const SEGMENT_LENGTH = TUNNEL_DEPTH;
const VIEW_AHEAD = 360;   // keep this much tunnel generated ahead of the player
const KEEP_BEHIND = 90;   // recycle segments once this far behind the player
const segments = [];
const segByIndex = new Map(); // z-index -> segment, for fast collision lookup
let nextSegmentIndex = 0; // ever-increasing, drives difficulty progression
let frontierZ = 0;        // most-negative z generated so far

function zKey(z) {
  return Math.round(-z / TUNNEL_DEPTH);
}

function spawnSegment(z) {
  const seg = createSegment(z, nextSegmentIndex++);
  segments.push(seg);
  segByIndex.set(zKey(z), seg);
}

function despawnSegment(seg) {
  scene.remove(seg.group);
  seg.group.traverse((o) => { if (o.isMesh && o.geometry) o.geometry.dispose(); });
  segByIndex.delete(zKey(seg.z));
}

function fillTunnelAhead(targetZ) {
  while (frontierZ >= targetZ) {
    spawnSegment(frontierZ);
    frontierZ -= SEGMENT_LENGTH;
  }
}

function updateTunnel() {
  fillTunnelAhead(player.position.z - VIEW_AHEAD);
  while (segments.length && segments[0].z > player.position.z + KEEP_BEHIND) {
    despawnSegment(segments.shift());
  }
}

// Rebuild the tunnel from the start (used when the player respawns at z=0).
function resetTunnel() {
  while (segments.length) despawnSegment(segments.pop());
  frontierZ = 0;
  nextSegmentIndex = 0;
  fillTunnelAhead(-VIEW_AHEAD);
}

function segmentAt(z) {
  return segByIndex.get(zKey(z));
}

// Is there solid tunnel surface at angle `theta` and depth `z`?
// (false = an open hole the player should fall through.)
function isSolidAt(theta, z) {
  const seg = segmentAt(z);
  if (!seg) return false;
  let k = Math.round(theta / seg.faceStep);
  const faceCenter = k * seg.faceStep;
  k = ((k % seg.sides) + seg.sides) % seg.sides;
  const face = seg.faces[k];

  const local = theta - faceCenter;
  const xOnFace = APOTHEM * Math.tan(local);

  // Floor pits: rectangular gap along the forward (Z) axis.
  if (face.zHole) {
    const relZ = z - seg.z;
    const inZHole = Math.abs(relZ - face.zHole.hz) <= face.zHole.hw / 2;
    const inXHole = Math.abs(xOnFace - face.zHole.hx) <= face.zHole.hxw / 2;
    if (inZHole && inXHole) return false;
  }

  // Side-wall gaps: tangential hole on angled faces.
  if (face.hole) {
    return Math.abs(xOnFace - face.hole.hx) > face.hole.hw / 2;
  }
  return true;
}

// Build the initial stretch of tunnel ahead of the player.
fillTunnelAhead(-VIEW_AHEAD);

// --- Radial player movement state ---
const gravity = -0.002;          // pulls the player outward toward the wall
const jumpStrength = 0.15;       // inward (toward tunnel axis) launch speed
let forwardSpeed = 0.07;
let gameStarted = false;
let isJumping = false;
let theta = 0;                   // angular position around the tunnel axis (0 = floor)
let hClear = STAND_OFFSET;       // perpendicular clearance above the current face
let velocityY = 0;               // radial velocity of hClear (also drives arm swing)

function applyRadialPosition() {
  const seg = segmentAt(player.position.z);
  const faceStep = seg ? seg.faceStep : Math.PI / 2;
  const faceCenter = Math.round(theta / faceStep) * faceStep;
  const local = theta - faceCenter;
  const r = (APOTHEM - hClear) / Math.cos(local);
  player.position.x = Math.sin(theta) * r;
  player.position.y = CENTER_Y - Math.cos(theta) * r;
  player.rotation.z = theta;
}

// Set up a clock to track time for the animation
const clock = new THREE.Clock();

// Function to animate limbs and antennas
function animateLimbsAndAntennas() {
  const time = clock.getElapsedTime();
  const speed = 5; // Speed of the swinging motion
  leftLeg.rotation.x = -Math.sin(time * speed) * 0.5;
  rightLeg.rotation.x = Math.sin(time * speed) * 0.5;
}

const fallThreshold = -40; // Define the height at which to reset the player
const startPosition = { x: 0, y: 1, z: 0 }; // Starting position for the player

function resetPlayer() {
  // Reset position to the starting position (floor of the polygon tunnel)
  player.position.set(startPosition.x, startPosition.y, startPosition.z);

  // Reset velocity and other states
  velocityY = 0;
  gameStarted = false;
  isJumping = false;
  theta = 0;
  hClear = STAND_OFFSET;
  score = 0;
  scoreElement.classList.remove('visible');
  scoreElement.textContent = 'Score: 0';
  player.rotation.set(0, 0, 0);

  // Optionally reset arm position
  leftArm.matrix.identity();
  rightArm.matrix.identity();
  leftArm.position.set(-0.6, 0.5, 0);
  rightArm.position.set(0.6, 0.5, 0);
  leftArm.updateMatrixWorld(true);
  rightArm.updateMatrixWorld(true);

  resetTunnel();
}

let lastSpeedUpdate = 0; // Track last speed update time
let isFastSpeed = false; // Toggle for speed state
let newColor = 0x00ff00;
let newbackgroundColor = 0x111111;

function updateSpeed() {
  const elapsedTime = clock.getElapsedTime();

  // Alternate speed every 3 seconds
  if (elapsedTime - lastSpeedUpdate >= 3) {
    forwardSpeed = isFastSpeed ? 0.11 : forwardSpeed;
    newColor = isFastSpeed ? 0xff0000 : 0x00ff00;
    newbackgroundColor = isFastSpeed ? 0xff0000 : 0x05060a;
    scene.background.set(newbackgroundColor);

    if (isFastSpeed) {
      playerLight.intensity = 25;
      playerLight.distance = 60;
    }
    else {
      playerLight.intensity = 1.5;
      playerLight.distance = 65;
    }

    platformMaterial.color.set(newColor);
    wallMaterial.color.set(newColor);
    roofMaterial.color.set(newColor);
    isFastSpeed = !isFastSpeed;
    lastSpeedUpdate = elapsedTime;
  }
}

function updatePlayer() {
  // Walk around the inside of the tube (theta orbits the tunnel axis).
  const angularStep = MOVE_LINEAR / (APOTHEM - STAND_OFFSET);
  if (keys.ArrowLeft) theta -= angularStep;
  else if (keys.ArrowRight) theta += angularStep;

  const solid = isSolidAt(theta, player.position.z);

  if (isJumping) {
    // Jump arcs inward toward the axis, then gravity pulls back out.
    velocityY += gravity;
    hClear += velocityY;
    if (velocityY <= 0 && hClear <= STAND_OFFSET && solid) {
      hClear = STAND_OFFSET;
      velocityY = 0;
      isJumping = false;
    }
  } else if (solid) {
    // Resting on a face.
    hClear = STAND_OFFSET;
    velocityY = 0;
  } else {
    // Open hole here: gravity pulls the player outward, through the gap.
    velocityY += gravity;
    hClear += velocityY;
  }

  applyRadialPosition();
  animateLimbsAndAntennas();

  {
    // Left Arm Transformation
    let leftArmTransform = new THREE.Matrix4();
    const leftSwingAngle = Math.sin(-Math.PI * velocityY * -1);
    const leftSide = translationMatrix(-1 * Math.sin(20), 0, 0);
    const leftRotation = rotationMatrixZ(leftSwingAngle);
    const leftTranslationToOrigin = translationMatrix(-0.6, -0.6, 0);
    const leftTranslationBack = translationMatrix(0.5, 0.6, 0);
    const leftTranslationUP = translationMatrix(0.7, -0.45, 0);
    const leftRotationSide = rotationMatrixZ(Math.sin(5));

    leftArmTransform.multiplyMatrices(leftTranslationBack, leftArmTransform);
    leftArmTransform.multiplyMatrices(leftTranslationToOrigin, leftArmTransform);
    leftArmTransform.multiplyMatrices(leftRotation, leftArmTransform);
    leftArmTransform.multiplyMatrices(leftSide, leftArmTransform);
    leftArmTransform.multiplyMatrices(leftTranslationUP, leftArmTransform);
    leftArmTransform.multiplyMatrices(leftRotationSide, leftArmTransform);

    leftArm.matrix.copy(leftArmTransform);
    leftArm.matrixAutoUpdate = false;

    // Right Arm Transformation (Mirrored)
    let rightArmTransform = new THREE.Matrix4();
    const rightSwingAngle = Math.sin(-Math.PI * velocityY * -1);
    const rightSide = translationMatrix(1 * Math.sin(20), 0, 0); // Mirrored translation
    const rightRotation = rotationMatrixZ(-rightSwingAngle); // Opposite rotation direction
    const rightTranslationToOrigin = translationMatrix(0.6, -0.6, 0); // Mirrored translation to origin
    const rightTranslationBack = translationMatrix(-0.5, 0.6, 0); // Mirrored translation back
    const rightTranslationUP = translationMatrix(-0.7, -0.45, 0); // Mirrored translation UP
    const rightRotationSide = rotationMatrixZ(-Math.sin(5)); // Opposite side rotation

    rightArmTransform.multiplyMatrices(rightTranslationBack, rightArmTransform);
    rightArmTransform.multiplyMatrices(rightTranslationToOrigin, rightArmTransform);
    rightArmTransform.multiplyMatrices(rightRotation, rightArmTransform);
    rightArmTransform.multiplyMatrices(rightSide, rightArmTransform);
    rightArmTransform.multiplyMatrices(rightTranslationUP, rightArmTransform);
    rightArmTransform.multiplyMatrices(rightRotationSide, rightArmTransform);

    rightArm.matrix.copy(rightArmTransform);
    rightArm.matrixAutoUpdate = false;
  }
  // Fell out through a hole (clearance well past the wall plane) -> respawn.
  if (hClear < -OUT_OF_BOUNDS) {
    resetPlayer();
  }
}


// Track which keys are being held down
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
};


let pause = false;

document.addEventListener('keydown', (event) => {
  if (event.key === 'p' || event.key === 'P') {
    pause = !pause;
  }

  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === ' ') {
    keys[event.key] = true;
  }
  if (event.key === ' ' && !isJumping) { // Jump only if not already jumping
    velocityY = jumpStrength;
    isJumping = true;

    // Start the game if space is pressed
    if (!gameStarted) {
      gameStarted = true;
      playCoinUpSound();
      backgroundMusic.setVolume(0.05);
      scoreElement.classList.add('visible');
    }
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === ' ') {
    keys[event.key] = false;
  }
});



// Camera trails behind the player and rolls with them around the tube so
// "down" is always toward the current face, whatever shape the tunnel is.
function updateCamera() {
  const blendingFactor = 0.08;

  // Inward direction (toward the tunnel axis) for the player's current angle.
  const inX = -Math.sin(theta);
  const inY = Math.cos(theta);

  const targetCameraPosition = new THREE.Vector3(
    player.position.x + inX * 2,
    player.position.y + inY * 2,
    player.position.z + 6
  );
  const targetUpVector = new THREE.Vector3(inX, inY, 0);

  camera.position.lerp(targetCameraPosition, blendingFactor);
  camera.up.lerp(targetUpVector, blendingFactor);
  camera.up.normalize();
  camera.lookAt(player.position);
}

let score = 0;
let gameEnded = false;

const startingScreen = document.getElementById('startingScreen');
const loadingScreen = document.getElementById('loadingScreen');
const scoreElement = document.getElementById('score');

function updateTitleScreenEffects() {
  const time = clock.getElapsedTime();

  player.position.y = startPosition.y + Math.sin(time * 2.2) * 0.18;
  player.rotation.y = Math.sin(time * 1.4) * 0.12;

  const glowPulse = 0.18 + Math.sin(time * 3) * 0.08;
  playerGlow.material.opacity = glowPulse;
  playerLight.intensity = 2 + Math.sin(time * 3) * 0.6;
  playerLight.color.setHSL(0.42, 0.85, 0.55 + Math.sin(time * 2) * 0.08);

  starfield.rotation.y += 0.0004;
  starfield.rotation.x += 0.00015;

  const fgPositions = foregroundStars.geometry.attributes.position;
  for (let i = 0; i < fgPositions.count; i++) {
    let z = fgPositions.getZ(i) - 0.08;
    if (z < -4) {
      z = 14;
      fgPositions.setX(i, THREE.MathUtils.randFloatSpread(28));
      fgPositions.setY(i, THREE.MathUtils.randFloatSpread(16));
    }
    fgPositions.setZ(i, z);
  }
  fgPositions.needsUpdate = true;
  animateLimbsAndAntennas();
}

function animate() {
  if (!pause && gameStarted && !gameEnded) {
    updateSpeed();
    player.position.z -= forwardSpeed;
    updateTunnel();
    updatePlayer();

    score = Math.abs(Math.floor(player.position.z));
    scoreElement.textContent = `Score: ${score}`;
  }

  if (gameStarted && !gameEnded) {
    startingScreen.style.display = 'none';
    loadingScreen.style.display = pause ? 'flex' : 'none';
    foregroundStars.visible = false;
    playerGlow.material.opacity = 0;
    playerLight.intensity = 12;
    playerLight.color.set(0xffffff);

    const endingScreen = document.getElementById('endingScreen');
    if (endingScreen) {
      endingScreen.style.display = 'none';
    }
    if (!backgroundMusic.isPlaying) {
      backgroundMusic.play();
    }
  } else if (!gameStarted) {
    startingScreen.style.display = 'flex';
    loadingScreen.style.display = 'none';
    foregroundStars.visible = true;
    scoreElement.classList.remove('visible');
    updateTitleScreenEffects();

    const endingScreen = document.getElementById('endingScreen');
    if (endingScreen) {
      endingScreen.style.display = 'none';
    }
    backgroundMusic.pause();
  }

  updateCamera();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}


animate();