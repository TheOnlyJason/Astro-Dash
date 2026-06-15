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
  backgroundMusic.play();
});

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
}

createStarfield();



const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x111111); // Dark gray/black color

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
const playerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
const playerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);

player.position.y = 1; // Start above the ground

let leftArm, rightArm, leftLeg, rightLeg, leftAntenna, rightAntenna;

// Function to add arms, legs, and antennas to the player
function addCharacterParts() {
  // Arm geometry and material
  const armGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.3, 12);
  const armMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

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

  // Leg geometry and material
  const legGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 12);
  const legMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  // Left Leg
  leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.3, -0.5, 0); // Positioned below and to the left
  player.add(leftLeg);

  // Right Leg
  rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.3, -0.5, 0); // Positioned below and to the right
  player.add(rightLeg);

  // Antenna geometry and material
  const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
  const antennaMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

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
  const antennaTipGeometry = new THREE.SphereGeometry(0.1, 8, 8);
  const antennaTipMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

  // Left Antenna Tip
  const leftAntennaTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial);
  leftAntennaTip.position.set(0, 0.2, 0);
  leftAntenna.add(leftAntennaTip);

  // Right Antenna Tip
  const rightAntennaTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial);
  rightAntennaTip.position.set(0, 0.2, 0);
  rightAntenna.add(rightAntennaTip);
}

// Call the function to add character parts to the player
addCharacterParts();



const platformMaterial = new THREE.MeshPhongMaterial({
  color: 0x00ff00,          // Swampy green-blue color
  shininess: 40,            // Moderate shininess for specular highlights
  specular: 0xffffff        // White specular highlight
});


function createPlatform(x, y, z) {
  const platformGroup = new THREE.Group();
 
  // Define a material with Phong shading for specular highlights

  const platformWidth = 15;
  const platformHeight = 0.1;
  const platformDepth = 10;
  const holeSize = 3 * Math.floor(Math.random() * 3) + 5;

  const holeOffsetX = Math.random() * (platformWidth - holeSize) - (platformWidth - holeSize) / 2;
  const holeOffsetZ = Math.random() * (platformDepth - holeSize) - (platformDepth - holeSize) / 2;

  if (holeOffsetX - holeSize / 2 > -platformWidth / 2) {
    const leftWidth = holeOffsetX - holeSize / 2 + platformWidth / 2;
    const leftPlatformGeometry = new THREE.BoxGeometry(leftWidth, platformHeight, platformDepth);
    const leftPlatform = new THREE.Mesh(leftPlatformGeometry, platformMaterial);
    leftPlatform.position.set(x - platformWidth / 2 + leftWidth / 2, y, z);
    platformGroup.add(leftPlatform);
  }

  if (holeOffsetX + holeSize / 2 < platformWidth / 2) {
    const rightWidth = platformWidth / 2 - holeOffsetX - holeSize / 2;
    const rightPlatformGeometry = new THREE.BoxGeometry(rightWidth, platformHeight, platformDepth);
    const rightPlatform = new THREE.Mesh(rightPlatformGeometry, platformMaterial);
    rightPlatform.position.set(x + platformWidth / 2 - rightWidth / 2, y, z);
    platformGroup.add(rightPlatform);
  }

  if (holeOffsetZ - holeSize / 2 > -platformDepth / 2) {
    const frontDepth = holeOffsetZ - holeSize / 2 + platformDepth / 2;
    const frontPlatformGeometry = new THREE.BoxGeometry(holeSize, platformHeight, frontDepth);
    const frontPlatform = new THREE.Mesh(frontPlatformGeometry, platformMaterial);
    frontPlatform.position.set(x + holeOffsetX, y, z + platformDepth / 2 - frontDepth / 2);
    platformGroup.add(frontPlatform);
  }

  if (holeOffsetZ + holeSize / 2 < platformDepth / 2) {
    const backDepth = platformDepth / 2 - holeOffsetZ - holeSize / 2;
    const backPlatformGeometry = new THREE.BoxGeometry(holeSize, platformHeight, backDepth);
    const backPlatform = new THREE.Mesh(backPlatformGeometry, platformMaterial);
    backPlatform.position.set(x + holeOffsetX, y, z - platformDepth / 2 + backDepth / 2);
    platformGroup.add(backPlatform);
  }

  platformGroup.position.set(x, y, z);
  scene.add(platformGroup);

  return platformGroup;
}


const startMaterial = new THREE.MeshPhongMaterial({ color: 0x9000ff, flatShading: false });
function createStart(x, y, z) {
  const startGeo = new THREE.BoxGeometry(15, 0.11, 10);
  const start = new THREE.Mesh(startGeo, startMaterial);
  scene.add(start);
  return start;
}


const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, flatShading: false });
const wallGeo = new THREE.BoxGeometry(0.1, 10, 10);


function createRWall(x, y, z) {
  const rightWall = new THREE.Group();
  const wallWidth = 0.1;
  const wallHeight = 10;
  const wallDepth = 10;
  const holeSize = Math.random() < 0.5 ? 6 : 7; // Randomly choose between 4 and 5

  // Decide whether to create a hole for each wall randomly
  const createRightHole = Math.random() < 0.4;
  if (createRightHole) {
    const maxOffsetRange = wallHeight / 2 - holeSize / 2;
    const holeOffsetY = THREE.MathUtils.randFloat(-maxOffsetRange, maxOffsetRange);

    if (holeOffsetY - holeSize / 2 > -wallHeight / 2) {
      const upperHeight = holeOffsetY - holeSize / 2 + wallHeight / 2;
      const upperWallGeometry = new THREE.BoxGeometry(wallWidth, upperHeight, wallDepth);
      const upperWall = new THREE.Mesh(upperWallGeometry, wallMaterial);
      upperWall.position.set(x + 7.5, y + 5 - wallHeight / 2 + upperHeight / 2, z);
      rightWall.add(upperWall);
    }

    if (holeOffsetY + holeSize / 2 < wallHeight / 2) {
      const lowerHeight = wallHeight / 2 - holeOffsetY - holeSize / 2;
      const lowerWallGeometry = new THREE.BoxGeometry(wallWidth, lowerHeight, wallDepth);
      const lowerWall = new THREE.Mesh(lowerWallGeometry, wallMaterial);
      lowerWall.position.set(x + 7.5, y + 5 + wallHeight / 2 - lowerHeight / 2, z);
      rightWall.add(lowerWall);
    }
  } else {
    const fullWallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
    const fullWall = new THREE.Mesh(fullWallGeometry, wallMaterial);
    fullWall.position.set(x + 7.5, y + 5, z);
    rightWall.add(fullWall);
  }

  scene.add(rightWall);
  return rightWall;
}

function createLWall(x, y, z) {
  const leftWall = new THREE.Group();
  const wallWidth = 0.1;
  const wallHeight = 10;
  const wallDepth = 10;
  const holeSize = Math.random() < 0.5 ? 6 : 7; // Randomly choose between 4 and 5

  // Decide whether to create a hole for each wall randomly
  const createLeftHole = Math.random() < 0.4;
  if (createLeftHole) {
    const maxOffsetRange = wallHeight / 2 - holeSize / 2;
    const holeOffsetY = THREE.MathUtils.randFloat(-maxOffsetRange, maxOffsetRange);

    if (holeOffsetY - holeSize / 2 > -wallHeight / 2) {
      const upperHeight = holeOffsetY - holeSize / 2 + wallHeight / 2;
      const upperWallGeometry = new THREE.BoxGeometry(wallWidth, upperHeight, wallDepth);
      const upperWall = new THREE.Mesh(upperWallGeometry, wallMaterial);
      upperWall.position.set(x - 7.5, y + 5 - wallHeight / 2 + upperHeight / 2, z);
      leftWall.add(upperWall);
    }

    if (holeOffsetY + holeSize / 2 < wallHeight / 2) {
      const lowerHeight = wallHeight / 2 - holeOffsetY - holeSize / 2;
      const lowerWallGeometry = new THREE.BoxGeometry(wallWidth, lowerHeight, wallDepth);
      const lowerWall = new THREE.Mesh(lowerWallGeometry, wallMaterial);
      lowerWall.position.set(x - 7.5, y + 5 + wallHeight / 2 - lowerHeight / 2, z);
      leftWall.add(lowerWall);
    }
  } else {
    const fullWallGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth);
    const fullWall = new THREE.Mesh(fullWallGeometry, wallMaterial);
    fullWall.position.set(x - 7.5, y + 5, z);
    leftWall.add(fullWall);
  }

  scene.add(leftWall);
  return leftWall;
}

const playerLight = new THREE.PointLight(0xFFFFFF, 1.5, 10, 2);
player.add(playerLight);
playerLight.position.set(0, 0, 0); // Center of the player


const lightHelper = new THREE.PointLightHelper(playerLight, 0.5); // Visual helper with a radius of 0.5
scene.add(lightHelper);




const roofMaterial = new THREE.MeshPhongMaterial({
  color: 0x00ff00,          // Swampy green-blue color
  shininess: 40,            // Moderate shininess for specular highlights
  specular: 0xffffff        // White specular highlight
});



function createRoof(x, y, z) {
  const roofGroup = new THREE.Group();
  const roofWidth = 15; // Width of the roof
  const roofHeight = 0.1; // Thickness of the roof
  const roofDepth = 10; // Depth of the roof
  const holeSize = 3 * Math.floor(Math.random() * 3) + 5; // Random hole size (multiples of 3 between 5 and 11)

  const holeOffsetX = Math.random() * (roofWidth - holeSize) - (roofWidth - holeSize) / 2; // Random X offset for the hole
  const holeOffsetZ = Math.random() * (roofDepth - holeSize) - (roofDepth - holeSize) / 2; // Random Z offset for the hole

  // Left part of the roof
  if (holeOffsetX - holeSize / 2 > -roofWidth / 2) {
    const leftWidth = holeOffsetX - holeSize / 2 + roofWidth / 2;
    const leftRoofGeometry = new THREE.BoxGeometry(leftWidth, roofHeight, roofDepth);
    const leftRoof = new THREE.Mesh(leftRoofGeometry, roofMaterial);
    leftRoof.position.set(x - roofWidth / 2 + leftWidth / 2, y, z);
    roofGroup.add(leftRoof);
  }

  // Right part of the roof
  if (holeOffsetX + holeSize / 2 < roofWidth / 2) {
    const rightWidth = roofWidth / 2 - holeOffsetX - holeSize / 2;
    const rightRoofGeometry = new THREE.BoxGeometry(rightWidth, roofHeight, roofDepth);
    const rightRoof = new THREE.Mesh(rightRoofGeometry, roofMaterial);
    rightRoof.position.set(x + roofWidth / 2 - rightWidth / 2, y, z);
    roofGroup.add(rightRoof);
  }

  // Front part of the roof
  if (holeOffsetZ - holeSize / 2 > -roofDepth / 2) {
    const frontDepth = holeOffsetZ - holeSize / 2 + roofDepth / 2;
    const frontRoofGeometry = new THREE.BoxGeometry(holeSize, roofHeight, frontDepth);
    const frontRoof = new THREE.Mesh(frontRoofGeometry, roofMaterial);
    frontRoof.position.set(x + holeOffsetX, y, z + roofDepth / 2 - frontDepth / 2);
    roofGroup.add(frontRoof);
  }

  // Back part of the roof
  if (holeOffsetZ + holeSize / 2 < roofDepth / 2) {
    const backDepth = roofDepth / 2 - holeOffsetZ - holeSize / 2;
    const backRoofGeometry = new THREE.BoxGeometry(holeSize, roofHeight, backDepth);
    const backRoof = new THREE.Mesh(backRoofGeometry, roofMaterial);
    backRoof.position.set(x + holeOffsetX, y, z - roofDepth / 2 + backDepth / 2);
    roofGroup.add(backRoof);
  }

  roofGroup.position.set(x, y + 10, z);
  scene.add(roofGroup);

  return roofGroup;
}


// Generate platforms and walls
const platforms = [];
const rWall = [];
const lWall = [];
const roofs = [];
const start = [];

start.push(createStart(0, 0, 0))
for (let i = 0; i < 1000; i = i + 2) {
  if(i % 3 == 0){
    platforms.push(createPlatform(0, 0, -i ));
    rWall.push(createRWall(0, 0, -i * 2));
  
    roofs.push(createRoof(0, 0, -i  ));
    lWall.push(createLWall(0, 0, -i * 2 ));
  }
}

// Raycaster for detecting platforms below player
const raycaster = new THREE.Raycaster();

const downVector = new THREE.Vector3(0, -1, 0); // Downward direction
const rightVector = new THREE.Vector3(1, 0, 0); // Right direction
const leftVector = new THREE.Vector3(-1, 0, 0); // Left direction
const upVector = new THREE.Vector3(0, 1, 0); // Downward direction


// Player movement variables
let velocityY = 9.81;
const gravity = -0.002;
const jumpStrength = 0.15;
let isJumping = false;
let forwardSpeed = 0.07;
const endPositionZ = -2000; // Define end position where player stops

const gravityDirection = new THREE.Vector3(0, 0, 1); // Gravity pulls toward the wall
 
let side = null;

// Track if the game has started
let gameStarted = false;

// Check start platform
function checkStartBelow() {
  raycaster.set(player.position, downVector);
  const intersects = raycaster.intersectObjects(start);

  // Return true if a platform is detected close below the player
  return intersects.length > 0 && intersects[0].distance <= 1;
}

// Check if there's a platform below the player
function checkPlatformBelow() {
  raycaster.set(player.position, downVector);
  const intersects = raycaster.intersectObjects(platforms);

  // Return true if a platform is detected close below the player
  return intersects.length > 0 && intersects[0].distance <= 1;
}

// Function to check for wall collisions on the right
function checkPlatformRight() {
  raycaster.set(player.position, rightVector);
  const intersects = raycaster.intersectObjects(rWall);

  // Return true if a platform is detected close below the player
  return intersects.length > 0 && intersects[0].distance <= 1;
}

// Function to check for wall collisions on the left
function checkPlatformLeft() {
  raycaster.set(player.position, leftVector);
  const intersects = raycaster.intersectObjects(lWall);

  // Return true if a platform is detected close below the player
  return intersects.length > 0 && intersects[0].distance <= 1;
}

function checkPlatformAbove() {
  raycaster.set(player.position, upVector);
  const intersects = raycaster.intersectObjects(roofs);

  // Return true if a platform is detected close below the player
  return intersects.length > 0 && intersects[0].distance <= 1;
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
  // Reset position to the starting position
  player.position.set(startPosition.x, startPosition.y, startPosition.z);

  // Reset velocity and other states
  velocityY = 0;
  gameStarted = false;
  isJumping = false;
  player.rotation.z = player.rotation.z * 0; // Rotate player to face the wall
  side = "floor";

  // Optionally reset arm position
  leftArm.matrix.identity();
  rightArm.matrix.identity();
  leftArm.position.set(-0.6, 0.5, 0);
  rightArm.position.set(0.6, 0.5, 0);
  leftArm.updateMatrixWorld(true);
  rightArm.updateMatrixWorld(true);
}
// side = "right"; 
// side = "left";  
side = "floor";

let lastSpeedUpdate = 0; // Track last speed update time
let isFastSpeed = false; // Toggle for speed state
let newColor = 0x00ff00;
let newbackgroundColor = 0x111111;

function updateSpeed() {
  const elapsedTime = clock.getElapsedTime();

  // Alternate speed every 3 seconds
  if (elapsedTime - lastSpeedUpdate >= 3) {
    forwardSpeed = isFastSpeed ? 0.11 : forwardSpeed;
    newColor = isFastSpeed ? 0xffffff : 0x00ff00;
    newbackgroundColor = isFastSpeed ? 0xffffff : 0x111111;
    scene.background = newbackgroundColor;

    if (isFastSpeed) {
      playerLight.intensity = 25;
      playerLight.distance = 60;
    }
    else {
      playerLight.intensity = 1.5;
      playerLight.distance = 10;
    }

    platformMaterial.color.set(newColor);
    wallMaterial.color.set(newColor);
    roofMaterial.color.set(newColor);
    isFastSpeed = !isFastSpeed;
    lastSpeedUpdate = elapsedTime;
  }
}

function updatePlayer() {

  if (gameStarted) {
    player.position.z -= forwardSpeed; // Constant forward movement
  }

  if (side == "right") {
    player.rotation.z = 1 * Math.PI / 2; // Rotate player to face the wall

    if (keys.ArrowLeft) {
      player.position.y -= 0.1; // Move left
    }
    else if (keys.ArrowRight) {
      player.position.y += 0.1; // Move right
    }
    // Check if the player should be falling
    if (!checkPlatformRight()) {
      velocityY += gravity;
    } else if (!isJumping) {
      velocityY = 0; // Reset vertical velocity when landing on a platform
    }

    player.position.x -= velocityY;
  }
  else if (side == "left") {
    player.rotation.z = -1 * Math.PI / 2; // Rotate player to face the wall

    if (keys.ArrowLeft) {
      player.position.y += 0.1; // Move left
    }
    else if (keys.ArrowRight) {
      player.position.y -= 0.1; // Move right
    }
    // Check if the player sh ould be falling
    if (!checkPlatformLeft()) {
      velocityY += gravity;
    } else if (!isJumping) {
      velocityY = 0; // Reset vertical velocity when landing on a platform
    }

    player.position.x += velocityY;
  }
  else if (side == "floor") {
    player.rotation.z = player.rotation.z * 0; // Rotate player to face the wall
    if (keys.ArrowLeft) {
      player.position.x -= 0.1; // Move left
    }
    else if (keys.ArrowRight) {
      player.position.x += 0.1; // Move right
    }

    // Check if the player should be falling
    if (!checkPlatformBelow()) {
      velocityY += gravity;
    } else if (!isJumping) {
      velocityY = 0; // Reset vertical velocity when landing on a platform
    }

    player.position.y += velocityY;
  }
  else if (side == "roof") {
    player.rotation.z = Math.PI; // Rotate player to face the wall
    if (keys.ArrowLeft) {
      player.position.x += 0.1; // Move left
    }
    else if (keys.ArrowRight) {
      player.position.x -= 0.1; // Move right
    }

    // Check if the player should be falling
    if (!checkPlatformAbove()) {
      velocityY += gravity;
    } else if (!isJumping) {
      velocityY = 0; // Reset vertical velocity when landing on a platform
    }

    player.position.y -= velocityY;
  }


  animateLimbsAndAntennas();


  // Stop the player from falling through the ground
  if (player.position.y <= 1 && checkStartBelow()) {
    player.position.y = 1;
    velocityY = 0;
    isJumping = false;
    // side = "floor";
  }

  if (player.position.y <= 1 && checkPlatformBelow()) {
    player.position.y = 1;
    velocityY = 0;
    isJumping = false;
    // side = "floor";
  }

  if (player.position.x >= 6.5 && checkPlatformRight()) {
    player.position.x = 6.5;
    velocityY = 0;
    isJumping = false;
    side = "right";
  } else if (player.position.x <= -6.5 && checkPlatformLeft()) {
    player.position.x = -6.5;
    velocityY = 0;
    isJumping = false;
    side = "left";
  } else if (player.position.y <= 1.00000001 && checkPlatformBelow()) {
    side = "floor";
    player.position.y = 1;
    velocityY = 0;
    isJumping = false; 
  } else if (player.position.y >= 8.9 && checkPlatformAbove()) {
    player.position.y = 9;
    velocityY = 0;
    isJumping = false;
    side = "roof";
  }

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
  if (player.position.y < fallThreshold || -player.position.y < fallThreshold || player.position.x < fallThreshold || -player.position.x < fallThreshold) {
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
    }
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === ' ') {
    keys[event.key] = false;
  }
});



// Camera follows player with smooth rotation
function updateCamera() {
  const radius = 5; // Distance from the player
  const blendingFactor = 0.05; // Adjust this for the smoothness of the transition

  // Define the target camera position and up vector
  let targetCameraPosition = new THREE.Vector3();
  let targetUpVector = new THREE.Vector3();

  if (side === "left") {
    const radians = THREE.MathUtils.degToRad(90); // 90-degree rotation for left wall
    const x = player.position.x + radius * Math.sin(radians) - 2;
    const z = player.position.z + radius * Math.cos(radians) + 5;
    const y = player.position.y;

    targetCameraPosition.set(x, y, z);
    targetUpVector.set(1, 0, 0); // Camera "up" vector for left wall
  } else if (side === "right") {
    const radians = THREE.MathUtils.degToRad(-90); // 90-degree rotation for right wall
    const x = player.position.x + radius * Math.sin(radians) + 2;
    const z = player.position.z + radius * Math.cos(radians) + 5;
    const y = player.position.y;

    targetCameraPosition.set(x, y, z);
    targetUpVector.set(-1, 0, 0); // Camera "up" vector for right wall
  } else if (side === "floor") {
    const radians = THREE.MathUtils.degToRad(0); // No rotation for floor
    const x = player.position.x + radius * Math.sin(radians);
    const z = player.position.z + radius * Math.cos(radians) + 1;
    const y = player.position.y + 2;

    targetCameraPosition.set(x, y, z);
    targetUpVector.set(0, 1, 0); // Camera "up" vector for floor
  } else if (side === "roof") {
    const radians = THREE.MathUtils.degToRad(180); // 180 rotation for roof
    const x = player.position.x + radius * Math.sin(radians);
    const z = player.position.z + radius * -Math.cos(radians) + 1;
    const y = player.position.y - 2;

    targetCameraPosition.set(x, y, z);
    targetUpVector.set(0, -1, 0); // Camera "up" vector for floor
  }

  // Smoothly interpolate camera position and up vector
  camera.position.lerp(targetCameraPosition, blendingFactor);
  camera.up.lerp(targetUpVector, blendingFactor);

  // Make the camera look at the player
  camera.lookAt(player.position);
}

let score = 0; // Player's score
let gameEnded = false;

function checkWinCondition() {
  // Check if the player has reached or passed the last platform's position
  if (player.position.z <= endPositionZ && !gameEnded) {
    pause = true; // Pause the game
    gameEnded = true; // Set the game to ended

    // Display the ending screen
    const endingScreen = document.getElementById("endingScreen");
    if (endingScreen) {
      endingScreen.style.display = "flex";
    }
  }
}


function animate() {
  if (!pause && gameStarted && !gameEnded) {
    updateSpeed(); // Update speed based on time
    player.position.z -= forwardSpeed; // Constant forward movement
    updatePlayer();
    checkWinCondition(); // Check if the player has won

    // Update score
    score = Math.abs(Math.floor(player.position.z)); // Use player's Z position for score
    document.getElementById("score").textContent = `Score: ${score}`;
  }

  // Display the appropriate screen
  if (gameStarted && !gameEnded) {
    startingScreen.style.display = 'none';
    loadingScreen.style.display = pause ? "flex" : "none";
    const endingScreen = document.getElementById("endingScreen");
    if (endingScreen) {
      endingScreen.style.display = "none"; // Hide the end screen
    }
    backgroundMusic.play();
  } else if (!gameStarted) {
    startingScreen.style.display = "flex";
    loadingScreen.style.display = "none";
    const endingScreen = document.getElementById("endingScreen");
    if (endingScreen) {
      endingScreen.style.display = "none"; // Ensure the ending screen is hidden
    }
    backgroundMusic.pause();
  }

  updateCamera();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}


animate();