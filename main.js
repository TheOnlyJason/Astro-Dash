import * as THREE from 'three';

// Set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;


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
		Math.sin(theta),  Math.cos(theta), 0, 0,
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

function createPlatform(x, y, z) {
  const platformGroup = new THREE.Group();

  // Define a material with Phong shading for specular highlights
  const platformMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff00,          // Swampy green-blue color
    shininess: 40,            // Moderate shininess for specular highlights
    specular: 0xffffff        // White specular highlight
  });

  const platformWidth = 15;
  const platformHeight = 0.1;
  const platformDepth = 8;
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


// Function to create walls
function createWalls(x, y, z) {
  const wallGeo = new THREE.BoxGeometry(0.1, 10, 10);
  // const wallMaterial = new THREE.MeshBasicMaterial({ color: 0x0000FF });

  const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00, flatShading: false }); // Gray color with flat shading


  const wall = new THREE.Mesh(wallGeo, wallMaterial);
  const wall2 = new THREE.Mesh(wallGeo, wallMaterial);
  wall.position.set(x - 7.5, y + 5, z);
  wall2.position.set(x + 7.5, y + 5, z);



  scene.add(wall);
  scene.add(wall2);
  return [wall, wall2];
}

// const ambientLight = new THREE.AmbientLight(0x404040, 1.5); // Softer ambient light
// scene.add(ambientLight);

const playerLight = new THREE.PointLight(0xFFFFFF, 1.5, 10, 2);
player.add(playerLight);
playerLight.position.set(0, 0, 0); // Center of the player

const lightHelper = new THREE.PointLightHelper(playerLight, 0.5); // Visual helper with a radius of 0.5
scene.add(lightHelper);

//
// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight.position.set(10, 10, 10);
// scene.add(directionalLight);

// Updated wall material with flatShading off
const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x0000FF, flatShading: false });

function createRoof(x, y, z) {
  const roofGeometry = new THREE.BoxGeometry(15, 0.1, 10);
  const roofMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff00,          // Swampy green-blue color
    shininess: 40,            // Moderate shininess for specular highlights
    specular: 0xffffff        // White specular highlight
  });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.set(x, y + 10, z);
  scene.add(roof);
  return roof;
}

// Generate platforms and walls
const platforms = [];
const walls = [];
const roofs = [];
for (let i = 0; i < 100; i++) {
  platforms.push(createPlatform(0, 0, -i * 2));
  // platforms.push(createPlatform(Math.random() * 15 - 7.5, 0, -i * 2));
  walls.push(createWalls(0, 0, -i * 2));
  roofs.push(createRoof(0, 0, -i * 2));
}

// Raycaster for detecting platforms below player
const raycaster = new THREE.Raycaster();
const leftRaycaster = new THREE.Raycaster();
const rightRaycaster = new THREE.Raycaster();

const downVector = new THREE.Vector3(0, -1, 0); // Downward direction
const rightVector = new THREE.Vector3(1, 0, 0); // Right direction
const leftVector = new THREE.Vector3(-1, 0, 0); // Left direction

// Player movement variables
let velocityY = 9.81;
const gravity = -0.002;
const jumpStrength = 0.15   ;
let isJumping = false;
let forwardSpeed = 0.15;
const endPositionZ = -200; // Define end position where player stops


// Track if the game has started
let gameStarted = false;

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
  const intersects = raycaster.intersectObjects(platforms);

  // Return true if a platform is detected close below the player
  return intersects.length > 0 && intersects[0].distance <= 1;
}

// Function to check for wall collisions on the left
function checkPlatformLeft() {
  raycaster.set(player.position, leftVector);
  const intersects = raycaster.intersectObjects(platforms);

  // Return true if a platform is detected close below the player
  return intersects.length > 0 && intersects[0].distance <= 1;
}

function collisions(){

}

// Set up a clock to track time for the animation
const clock = new THREE.Clock();

// Function to animate limbs and antennas
function animateLimbsAndAntennas() {
  const time = clock.getElapsedTime();
  const speed = 5; // Speed of the swinging motion

  // Swing arms and legs back and forth
  // leftArm.rotation.x = Math.sin(time * speed) * 0.5;
  // rightArm.rotation.x = -Math.sin(time * speed) * 0.5;
  leftLeg.rotation.x = -Math.sin(time * speed) * 0.5;
  rightLeg.rotation.x = Math.sin(time * speed) * 0.5;


}

let targetRotationZ = 0; // Target rotation for leaning

const fallThreshold = -40; // Define the height at which to reset the player
const startPosition = { x: 0, y: 1, z: 0 }; // Starting position for the player

function resetPlayer() {
  // Reset position to the starting position
  player.position.set(startPosition.x, startPosition.y, startPosition.z);

  // Reset velocity and other states
  velocityY = 0;
  isJumping = false;

  // Optionally reset arm position
  leftArm.matrix.identity();
  rightArm.matrix.identity();
  leftArm.position.set(-0.6, 0.5, 0);
  rightArm.position.set(0.6, 0.5, 0);
  leftArm.updateMatrixWorld(true);
  rightArm.updateMatrixWorld(true);
}

// Player controls and gravity //&& player.position.z > endPositionZ
function updatePlayer() {
  if (gameStarted) {
    player.position.z -= forwardSpeed; // Constant forward movement
  }
  if (keys.ArrowLeft) {
   player.position.x -= 0.1; // Move left
 }
 else if (keys.ArrowRight) {
   player.position.x += 0.1; // Move right
 }
 animateLimbsAndAntennas();

  // Check if the player should be falling
  if (!checkPlatformBelow()) {
    velocityY += gravity;
  } else if (!isJumping) {
    velocityY = 0; // Reset vertical velocity when landing on a platform
  }

  // Apply vertical movement (falling or jumping)
  player.position.y += velocityY;

  // Stop the player from falling through the ground
  if (player.position.y <= 1 && checkPlatformBelow()) {
    player.position.y = 1;
    velocityY = 0;
    isJumping = false;
  }

  // Stop player from intersecting walls
  if (player.position.x >= 6.5 && !checkPlatformRight()){
    player.position.x = 6.5;
  } else if (player.position.x <= -6.5 && !checkPlatformLeft()){
    player.position.x = -6.5;
  }


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

  if (player.position.y < fallThreshold) {
    resetPlayer();
  }
}



// TODO: Implement the Gouraud Shader for Planet 2
function createGouraudMaterial(materialProperties) {
    // TODO: Implement the Vertex Shader in GLSL
    let vertexShader = `
			precision mediump float;
        const int N_LIGHTS = 1;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS];
        uniform vec4 light_colors[N_LIGHTS];
				uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;
        varying vec4 vColor;


				vec3 phong_model_lights(vec3 N, vec3 vertex_worldspace) {
            vec3 E = normalize(camera_center - vertex_worldspace);
            vec3 result = vec3(0.0);
            for(int i = 0; i < N_LIGHTS; i++) {
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz -
                    light_positions_or_vectors[i].w * vertex_worldspace;
                float distance_to_light = length(surface_to_light_vector);
                vec3 L = normalize(surface_to_light_vector);
                vec3 H = normalize(L + E);
                float diffuse = max(dot(N, L), 0.0);
                float specular = pow(max(dot(N, H), 0.0), smoothness);
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light);
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                        + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        }

        void main() {
						// the vertex's final reseting place( in NDCS):
						gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

						// the final normal vector in screen space
            vec3 N = normalize(normalMatrix * normal); // Normal vector in camera space
            vec3 vertex_worldspace = (modelMatrix * vec4(position, 1.0)).xyz;
            vec3 E = normalize(camera_center - vertex_worldspace);

						// Compute an initial (ambient) color:
						vec4 color = vec4(shape_color.xyz * ambient, shape_color.w);
						// Compute the final color with contributions from lights:
						color.xyz += phong_model_lights(normalize(N), vertex_worldspace);

						vColor = color;
        }
    `;

    // TODO: Implement the Fragment Shader in GLSL
    let fragmentShader = `
		precision mediump float;
        varying vec4 vColor;

        void main() {
            gl_FragColor = vColor; // Pass interpolated color from vertex shader
						return;
        }
		`;

    let shape_color = new THREE.Vector4(
        materialProperties.color.r,
        materialProperties.color.g,
        materialProperties.color.b,
        1.0
    );

    // Uniforms
    const uniforms = {
        ambient: { value: materialProperties.ambient },
        diffusivity: { value: materialProperties.diffusivity },
        specularity: { value: materialProperties.specularity },
        smoothness: { value: materialProperties.smoothness },
        shape_color: { value: shape_color },
        squared_scale: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        camera_center: { value: new THREE.Vector3() },
        model_transform: { value: new THREE.Matrix4() },
        projection_camera_model_transform: { value: new THREE.Matrix4() },
        light_positions_or_vectors: { value: [] },
        light_colors: { value: [] },
        light_attenuation_factors: { value: [] }
    };

    // Create the ShaderMaterial using the custom vertex and fragment shaders
    return new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms
    });
}

// Custom Phong Shader has already been implemented, no need to make change.
function createPhongMaterial(materialProperties) {
    const numLights = 1;
    // Vertex Shader
    let vertexShader = `
        precision mediump float;
        const int N_LIGHTS = ${numLights};
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS];
        uniform vec4 light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale;
        uniform vec3 camera_center;
        varying vec3 N, vertex_worldspace;

        // ***** PHONG SHADING HAPPENS HERE: *****
        vec3 phong_model_lights(vec3 N, vec3 vertex_worldspace) {
            vec3 E = normalize(camera_center - vertex_worldspace);
            vec3 result = vec3(0.0);
            for(int i = 0; i < N_LIGHTS; i++) {
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz -
                    light_positions_or_vectors[i].w * vertex_worldspace;
                float distance_to_light = length(surface_to_light_vector);
                vec3 L = normalize(surface_to_light_vector);
                vec3 H = normalize(L + E);
                float diffuse = max(dot(N, L), 0.0);
                float specular = pow(max(dot(N, H), 0.0), smoothness);
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light);
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                        + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        }

        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;

        void main() {
            gl_Position = projection_camera_model_transform * vec4(position, 1.0);
            N = normalize(mat3(model_transform) * normal / squared_scale);
            vertex_worldspace = (model_transform * vec4(position, 1.0)).xyz;
        }
    `;
    // Fragment Shader
    let fragmentShader = `
        precision mediump float;
        const int N_LIGHTS = ${numLights};
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS];
        uniform vec4 light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 camera_center;
        varying vec3 N, vertex_worldspace;

        // ***** PHONG SHADING HAPPENS HERE: *****
        vec3 phong_model_lights(vec3 N, vec3 vertex_worldspace) {
            vec3 E = normalize(camera_center - vertex_worldspace);
            vec3 result = vec3(0.0);
            for(int i = 0; i < N_LIGHTS; i++) {
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz -
                    light_positions_or_vectors[i].w * vertex_worldspace;
                float distance_to_light = length(surface_to_light_vector);
                vec3 L = normalize(surface_to_light_vector);
                vec3 H = normalize(L + E);
                float diffuse = max(dot(N, L), 0.0);
                float specular = pow(max(dot(N, H), 0.0), smoothness);
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light);
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                        + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        }

        void main() {
            // Compute an initial (ambient) color:
            vec4 color = vec4(shape_color.xyz * ambient, shape_color.w);
            // Compute the final color with contributions from lights:
            color.xyz += phong_model_lights(normalize(N), vertex_worldspace);
            gl_FragColor = color;
        }
    `;

    let shape_color = new THREE.Vector4(
        materialProperties.color.r,
        materialProperties.color.g,
        materialProperties.color.b,
        1.0
    );
    // Prepare uniforms
    const uniforms = {
        ambient: { value: materialProperties.ambient },
        diffusivity: { value: materialProperties.diffusivity },
        specularity: { value: materialProperties.specularity },
        smoothness: { value: materialProperties.smoothness },
        shape_color: { value: shape_color },
        squared_scale: { value: new THREE.Vector3(1.0, 1.0, 1.0) },
        camera_center: { value: new THREE.Vector3() },
        model_transform: { value: new THREE.Matrix4() },
        projection_camera_model_transform: { value: new THREE.Matrix4() },
        light_positions_or_vectors: { value: [] },
        light_colors: { value: [] },
        light_attenuation_factors: { value: [] }
    };

    // Create the ShaderMaterial using the custom vertex and fragment shaders
    return new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms
    });
}

// TODO: Finish the custom shader for planet 3's ring with sinusoidal brightness variation
function createRingMaterial(materialProperties) {
    let vertexShader = `
        varying vec3 vPosition;
        void main() {
            vPosition = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
    `;

    // TODO: Finish the fragment shader to create the brightness variation with sinine finction
    let fragmentShader = `
        uniform vec3 color;
        varying vec3 vPosition;

        void main() {

        }
    `;

    // TODO: Fill in the values to be passed in to create the custom shader
    return new THREE.ShaderMaterial({
        uniforms: {color: null},

    });
}

// Track which keys are being held down
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
};
// Track the current rotation angle around the player (in degrees)
let cameraAngle = 0;
// Event listeners to track key states
document.addEventListener('keydown', (event) => {
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
  if (event.key === 'c') {
    // Rotate camera 90 degrees to the right
    cameraAngle -= 90;
  } else if (event.key === 'v') {
    // Rotate camera 90 degrees to the left
    cameraAngle += 90;
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === ' ') {
    keys[event.key] = false;
  }
});

// Camera follows player
function updateCamera() {
  const radians = THREE.MathUtils.degToRad(cameraAngle);

  // Calculate the new camera position based on the Y-axis rotation
  const radius = 5; // Distance from the player
  camera.position.x = player.position.x + radius * Math.sin(radians);
  camera.position.z = player.position.z + radius * Math.cos(radians);
  camera.position.y = player.position.y + 2; // Keep camera slightly above the player


  camera.lookAt(player.position);
}

// Render loop
function animate() {
  requestAnimationFrame(animate);

  updatePlayer();
  updateCamera();

  renderer.render(scene, camera);
}

animate();
