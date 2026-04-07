// public/js/scene.js

// State variables for Day/Night Transition
let isNightMode = document.documentElement.classList.contains('dark');
let transitionProgress = isNightMode ? 1.0 : 0.0;
const transitionSpeed = 0.02;

// Arrays to hold elements that need color/intensity updates
const windowMaterials = [];
const houseLightMaterials = [];
const streetLightMaterials = [];
const trafficLights = [];

// Scene Setup
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();

// Environment Fog
scene.fog = new THREE.FogExp2(0x0a192f, 0.0025);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1500);
camera.position.set(0, 100, 200);
camera.lookAt(0, 15, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
container.appendChild(renderer.domElement);

// ==========================================
// POST-PROCESSING (BLOOM)
// ==========================================
const renderScene = new THREE.RenderPass(scene, camera);

const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, // strength
    0.4, // radius
    0.85 // threshold
);

const composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(bloomPass);

// ==========================================
// LIGHTING & CELESTIAL BODIES (SUN / MOON)
// ==========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(50, 100, 50);
directionalLight.castShadow = true;
scene.add(directionalLight);

// =======================
// SUN MESH (Spiky Sun)
// =======================
const sunMesh = new THREE.Group(); // We use a group globally but keep the original variable name for logic
const sunCoreGeo = new THREE.SphereGeometry(22, 32, 32);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffeebb, fog: false });
const sunCore = new THREE.Mesh(sunCoreGeo, sunMat);
sunMesh.add(sunCore);

// Tambahkan duri-duri (Rays/Spikes)
const spikeCount = 14;
const spikeGeo = new THREE.ConeGeometry(3, 16, 8);
for(let i=0; i<spikeCount; i++) {
    const angle = (i / spikeCount) * Math.PI * 2;
    const spike = new THREE.Mesh(spikeGeo, sunMat);
    spike.position.x = Math.cos(angle) * 26;
    spike.position.y = Math.sin(angle) * 26;
    spike.rotation.z = angle - Math.PI/2;
    sunMesh.add(spike);
}
scene.add(sunMesh);

// =======================
// MOON MESH (Crescent Moon / Bulan Sabit)
// =======================
// Algoritma: Dua lingkaran berukuran sama (R=20), lingkaran dalam digeser 10 unit ke kanan.
// Sabit = area di lingkaran luar tapi BUKAN di lingkaran dalam (sisi kiri).
const moonR = 20;
const moonOffset = 10; // Geser lingkaran pemotong ke kanan

// Hitung titik potong kedua lingkaran
const ix = moonOffset / 2; // = 5
const iy = Math.sqrt(moonR * moonR - ix * ix); // ≈ 19.36

// Sudut pada lingkaran luar (pusat 0,0)
const outerAngleTop = Math.atan2(iy, ix);
const outerAngleBot = Math.atan2(-iy, ix);

// Sudut pada lingkaran dalam (pusat moonOffset,0)
const innerAngleTop = Math.atan2(iy, ix - moonOffset);
const innerAngleBot = Math.atan2(-iy, ix - moonOffset);

const moonShape = new THREE.Shape();
// Mulai dari titik potong atas
moonShape.moveTo(ix, iy);
// Busur LUAR: dari atas ke bawah, melewati sisi KIRI (clockwise = true)
moonShape.absarc(0, 0, moonR, outerAngleTop, outerAngleBot, true);
// Busur DALAM: dari bawah kembali ke atas, melewati sisi KANAN (counter-clockwise = false)
moonShape.absarc(moonOffset, 0, moonR, innerAngleBot, innerAngleTop, false);

const extrudeSettings = { depth: 5, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 1, bevelThickness: 1 };
const moonGeo = new THREE.ExtrudeGeometry(moonShape, extrudeSettings);

// Pusatkan geometri dan putar diagonal agar terlihat natural
moonGeo.center();
moonGeo.rotateZ(-Math.PI / 6);

const moonMat = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc, 
    emissive: 0xeeeeee, 
    emissiveIntensity: 0.9, 
    roughness: 0.5,
    fog: false 
});
const moonMesh = new THREE.Mesh(moonGeo, moonMat);
scene.add(moonMesh);

// ==========================================
// MATERIALS (Realistic / Premium)
// ==========================================
const materials = {
    // Colors based on the real PLN Pusdiklat building
    plnWall: new THREE.MeshPhysicalMaterial({ color: 0xebe6d1, roughness: 0.9, clearcoat: 0.05 }), // Cream wall
    plnRoof: new THREE.MeshPhysicalMaterial({ color: 0x8b3a3a, roughness: 0.8, clearcoat: 0.1 }), // Redish clay roof
    
    // Natural environment
    treeTrunk: new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 1.0 }),
    treeLeaves: new THREE.MeshStandardMaterial({ color: 0x245224, roughness: 0.8 }),
    grass: new THREE.MeshStandardMaterial({ color: 0x2b4221, roughness: 1.0 }),
    
    // Other buildings
    institution: new THREE.MeshPhysicalMaterial({ color: 0xdddddd, roughness: 0.2, metalness: 0.5, clearcoat: 0.5 }),
    houseBody: new THREE.MeshStandardMaterial({ color: 0xd9dfeb, roughness: 0.9 }),
    houseRoof: new THREE.MeshStandardMaterial({ color: 0x4a4f5c, roughness: 0.8 }),
    
    // Infrastructure
    road: new THREE.MeshStandardMaterial({ color: 0x181818, roughness: 0.8 }),
    ground: new THREE.MeshStandardMaterial({ color: 0x0a0f12, roughness: 1.0 })
};

// ==========================================
// BUILDINGS & CITY LOGIC
// ==========================================
const cityGroup = new THREE.Group();
// Geser seluruh kota ke kanan agar teks 3D tulisan PLN tidak tertutup teks HTML di sebelah kiri
cityGroup.position.x = 45; 
// Sedikit diputar agar menghadap diagonal menghadap kamera
cityGroup.rotation.y = -0.15;
scene.add(cityGroup);

// Ground Plane
const groundGeo = new THREE.PlaneGeometry(800, 800);
const groundMesh = new THREE.Mesh(groundGeo, materials.ground);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.position.y = -0.1;
cityGroup.add(groundMesh);

// Grassy Campus Ground Area
const campusGeo = new THREE.PlaneGeometry(120, 80);
const campusMesh = new THREE.Mesh(campusGeo, materials.grass);
campusMesh.rotation.x = -Math.PI / 2;
campusMesh.position.set(0, 0, -25);
cityGroup.add(campusMesh);

// Helper to create glowing windows
function createWindows(width, height, depth, rows, cols, isHouse = false, excludeMiddle = false) {
    const windowGroup = new THREE.Group();
    const winGeo = new THREE.PlaneGeometry(width / cols * 0.4, height / rows * 0.4);
    
    const winMat = new THREE.MeshStandardMaterial({ 
        color: 0x000000, 
        emissive: isHouse ? 0xffcc88 : 0x00e5ff, 
        emissiveIntensity: 0.0
    });

    if (isHouse) {
        houseLightMaterials.push(winMat);
    } else {
        windowMaterials.push(winMat);
    }

    const startX = -width / 2 + (width / cols) / 2;
    const startY = -height / 2 + (height / rows) / 2;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            // Jika fitur excludeMiddle diaktifkan, jangan buat jendela di area tengah-bawah
            if (excludeMiddle && c > 0 && c < cols - 1 && r < 2) {
                continue;
            }

            const win = new THREE.Mesh(winGeo, winMat);
            win.position.set(startX + c * (width / cols), startY + r * (height / rows), depth / 2 + 0.02);
            if (Math.random() > 0.3) {
                windowGroup.add(win);
            }
        }
    }
    return windowGroup;
}

// Low-poly Hip/Pyramid Roof Helper
function createHipRoof(w, d, h) {
    const radius = (Math.max(w, d) / 2) * Math.sqrt(2);
    const geo = new THREE.ConeGeometry(radius, h, 4);
    geo.rotateY(Math.PI / 4); 
    // Small scaling correction for non-square rectangles
    if(w > d) {
        geo.scale(1, 1, d/w);
    } else if(d > w) {
        geo.scale(w/d, 1, 1);
    }
    return geo;
}

// 1. Landmark Building (Realistic PLN Pusdiklat)
function createLandmarkBuilding(x, z) {
    const group = new THREE.Group();
    
    // LEFT WING
    const wingW = 28, wingH = 20, wingD = 18;
    const leftWing = new THREE.Mesh(new THREE.BoxGeometry(wingW, wingH, wingD), materials.plnWall);
    leftWing.position.set(-24, wingH/2, 0);
    const lwWindows = createWindows(wingW, wingH, wingD, 4, 6, false);
    lwWindows.position.copy(leftWing.position);
    group.add(leftWing, lwWindows);
    
    const lwRoof = new THREE.Mesh(createHipRoof(wingW + 4, wingD + 4, 8), materials.plnRoof);
    lwRoof.position.set(-24, wingH + 4, 0);
    group.add(lwRoof);

    // RIGHT WING
    const rightWing = new THREE.Mesh(new THREE.BoxGeometry(wingW, wingH, wingD), materials.plnWall);
    rightWing.position.set(24, wingH/2, 0);
    const rwWindows = createWindows(wingW, wingH, wingD, 4, 6, false);
    rwWindows.position.copy(rightWing.position);
    group.add(rightWing, rwWindows);
    
    const rwRoof = new THREE.Mesh(createHipRoof(wingW + 4, wingD + 4, 8), materials.plnRoof);
    rwRoof.position.set(24, wingH + 4, 0);
    group.add(rwRoof);

    // CENTRAL MAIN BLOCK (Diorama style of real Pusdiklat)
    const centerW = 24, centerH = 28, centerD = 24;
    const centerBlock = new THREE.Mesh(new THREE.BoxGeometry(centerW, centerH, centerD), materials.plnWall);
    centerBlock.position.set(0, centerH/2, 2); // Slightly protruding forward
    const cWindows = createWindows(centerW - 4, centerH - 10, centerD, 4, 4, false, true); // exclude middle to make room for logo
    cWindows.position.set(0, centerH/2 + 3, 2);
    group.add(centerBlock, cWindows);

    const cRoof = new THREE.Mesh(createHipRoof(centerW + 6, centerD + 6, 12), materials.plnRoof);
    cRoof.position.set(0, centerH + 6, 2);
    group.add(cRoof);

    // Entrance Canopy / Tunnel structure
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(16, 8, 12), new THREE.MeshStandardMaterial({color: 0x222222}));
    canopy.position.set(0, 4, 10);
    group.add(canopy);

    // Add 3D Text "PT PLN (PERSERO) PUSAT PENDIDIKAN DAN PELATIHAN" Equivalent
    const loader = new THREE.FontLoader();
    loader.load('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/fonts/helvetiker_bold.typeface.json', function(font) {
        const textGeo = new THREE.TextGeometry('PLN PUSDIKLAT', {
            font: font, size: 2.2, height: 0.5,
            curveSegments: 4, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.05, bevelSegments: 2
        });
        
        const textMat = new THREE.MeshStandardMaterial({
            color: 0x00e5ff, emissive: 0x00e5ff, emissiveIntensity: 1.0, roughness: 0.1, metalness: 0.8
        });
        windowMaterials.push(textMat); 

        const textMesh = new THREE.Mesh(textGeo, textMat);
        textGeo.computeBoundingBox();
        const tWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
        // Place text boldly above the entrance canopy, resting on the wall
        textMesh.position.set(-tWidth / 2, 12, 14.5); 
        group.add(textMesh);
    });

    group.position.set(x, 0, z);
    cityGroup.add(group);
}

// 2. Realistic Trees
function createTree(x, z) {
    const group = new THREE.Group();
    const h = 4 + Math.random() * 4;
    
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, h), materials.treeTrunk);
    trunk.position.y = h/2;
    group.add(trunk);
    
    // Abstract low-poly foliage (Dodecahedron looks modern and fluffy)
    const capGeo = new THREE.DodecahedronGeometry(2.5 + Math.random(), 0); 
    const leaves = new THREE.Mesh(capGeo, materials.treeLeaves);
    leaves.position.y = h + 1.5;
    
    // Soft random rotation so trees look organic
    leaves.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
    group.add(leaves);
    
    group.position.set(x, 0, z);
    cityGroup.add(group);
}

// 3. Medium Institution Buildings (Tiered design - staying futuristic)
function createInstitutionBuilding(x, z, h) {
    const group = new THREE.Group();
    const w = 12 + Math.random() * 8;
    const d = 12 + Math.random() * 8;
    
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(w, h*0.6, d), materials.institution);
    p1.position.set(0, (h*0.6)/2, 0);
    group.add(p1);

    const p2 = new THREE.Mesh(new THREE.BoxGeometry(w*0.8, h*0.4, d*0.8), materials.institution);
    p2.position.set(0, h*0.6 + (h*0.4)/2, 0);
    group.add(p2);

    const windows = createWindows(w, h*0.6, d, Math.floor((h*0.6)/3), 3, false);
    windows.position.set(0, (h*0.6)/2, 0);
    group.add(windows);

    group.position.set(x, 0, z);
    cityGroup.add(group);
}

// 4. Realistic Residential / Support Housing (with roofs)
function createResidentialHouse(x, z) {
    const w = 5 + Math.random() * 3;
    const h = 4 + Math.random() * 4;
    const d = 5 + Math.random() * 3;
    
    const group = new THREE.Group();
    
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), materials.houseBody);
    body.position.set(0, h/2, 0);
    group.add(body);

    const roofH = 2 + Math.random()*2;
    const roof = new THREE.Mesh(createHipRoof(w+1.5, d+1.5, roofH), materials.houseRoof);
    roof.position.set(0, h + roofH/2, 0);
    group.add(roof);

    const windows = createWindows(w, h, d, Math.floor(h/2), 2, true);
    windows.position.set(0, h/2, 0);
    group.add(windows);
    
    group.position.set(x, 0, z);
    cityGroup.add(group);
}

// 5. Street Lamps
function createLampPost(x, z) {
    const h = 4;
    const group = new THREE.Group();
    
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, h), new THREE.MeshStandardMaterial({color: 0x333333}));
    pole.position.y = h/2;
    group.add(pole);

    const bulbMat = new THREE.MeshStandardMaterial({
        color: 0xffffff, emissive: 0x00e5ff, emissiveIntensity: 0
    });
    streetLightMaterials.push(bulbMat);
    
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.6), bulbMat);
    bulb.position.y = h;
    group.add(bulb);
    
    group.position.set(x, 0, z);
    cityGroup.add(group);
}

// 6. Dynamic Traffic Particles
function createTraffic() {
    const trafficGeo = new THREE.BufferGeometry();
    const particleCount = 100;
    const positions = new Float32Array(particleCount * 3);
    const directions = []; 
    
    for (let i = 0; i < particleCount; i++) {
        const isOnXRoad = Math.random() > 0.6; // More cars on main road
        let pX, pZ, dir;
        
        if (isOnXRoad) {
            pX = (Math.random() - 0.5) * 400;
            pZ = (Math.random() - 0.5) * 8 + 35; // Main horizontal road
            dir = { x: (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.3), z: 0 }; 
        } else {
            pX = (Math.random() - 0.5) * 8; 
            pZ = 35 + Math.random() * 300; // Vertical road only goes south from highway
            dir = { x: 0, z: (0.2 + Math.random() * 0.3) }; // Only head south
        }

        positions[i*3] = pX;
        positions[i*3+1] = 0.5; 
        positions[i*3+2] = pZ;
        directions.push(dir);
    }

    trafficGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const trafficMat = new THREE.PointsMaterial({
        color: 0xffffff, size: 1.5, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending
    });
    
    const trafficSys = new THREE.Points(trafficGeo, trafficMat);
    cityGroup.add(trafficSys);
    trafficLights.push({ sys: trafficSys, dirs: directions, mat: trafficMat });
}

// Helper to prevent spawning on roads or campus
function isRestrictedArea(x, z) {
    // Campus Area
    if (Math.abs(x) < 60 && z < 20 && z > -70) return true;
    
    // Horizontal Road (Z around 35)
    if (Math.abs(z - 35) < 10) return true;
    
    // Vertical Road (X around 0, Z > 30)
    if (Math.abs(x) < 10 && z > 30) return true;
    
    return false;
}

// ==========================================
// POPULATE THE CITY
// ==========================================
// Build the realistic main Pusdiklat building in the center
createLandmarkBuilding(0, -35);

// Plant Trees in the main campus area
for (let i = 0; i < 40; i++) {
    const tX = (Math.random() - 0.5) * 100;
    const tZ = (Math.random() - 0.5) * 60 - 25; 
    if (Math.abs(tX) > 40 || tZ < -45 || tZ > -5) {
        if (!isRestrictedArea(tX, tZ)) createTree(tX, tZ);
    }
}

// Institution Buildings Rings
for (let i = 0; i < 15; i++) {
    const angle = (i / 15) * Math.PI * 2;
    const rad = 65 + Math.random() * 20;
    const px = Math.cos(angle) * rad;
    const pz = Math.sin(angle) * rad - 25;
    
    if (isRestrictedArea(px, pz)) continue;
    createInstitutionBuilding(px, pz, 15 + Math.random() * 20);
}

// Spread Trees globally along streets
for (let i = 0; i < 80; i++) {
    const angle = Math.random() * Math.PI * 2;
    const rad = 40 + Math.random() * 80;
    const px = Math.cos(angle) * rad;
    const pz = Math.sin(angle) * rad;
    if (!isRestrictedArea(px, pz)) createTree(px, pz);
}

// Residential Houses cluster
for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const rad = 100 + Math.random() * 80;
    const px = Math.cos(angle) * rad;
    const pz = Math.sin(angle) * rad;
    
    if (isRestrictedArea(px, pz)) continue;
    createResidentialHouse(px, pz);
}

// Roads
const road1 = new THREE.Mesh(new THREE.PlaneGeometry(500, 12), materials.road);
road1.rotation.x = -Math.PI / 2;
road1.position.set(0, 0, 35); // Horizontal highway
cityGroup.add(road1);

const road2 = new THREE.Mesh(new THREE.PlaneGeometry(12, 300), materials.road);
road2.rotation.x = -Math.PI / 2;
road2.position.set(0, 0, 185); // Vertical road starts at Z=35 and goes South to 335
cityGroup.add(road2);

// Add Street Lamps
for (let i = -160; i <= 160; i += 30) {
    if (Math.abs(i) > 20) {
        createLampPost(i, 29);
        createLampPost(i, 41);
        createLampPost(6, i);
        createLampPost(-6, i);
    }
}

createTraffic();

// ==========================================
// DAY / NIGHT TRANSITION LOGIC
// ==========================================
const colors = {
    // Realistic Sky Blue instead of glaring white
    daySky: new THREE.Color(0x87CEEB),
    nightSky: new THREE.Color(0x050b14), 
    
    // Warmer & softer lighting for daytime to prevent wash-out
    dayAmbient: new THREE.Color(0xfff8ee),
    nightAmbient: new THREE.Color(0x112244),
    
    // Gentle golden hour / realistic sun color
    dayDir: new THREE.Color(0xfff0c2),
    nightDir: new THREE.Color(0x223355)
};

if(isNightMode) {
    renderer.setClearColor(colors.nightSky);
    scene.fog.color.copy(colors.nightSky);
} else {
    renderer.setClearColor(colors.daySky);
    scene.fog.color.copy(colors.daySky);
}

window.addEventListener('themeChanged', (e) => {
    isNightMode = e.detail === 'dark';
});

function updateLightingAndMaterials() {
    const target = isNightMode ? 1.0 : 0.0;
    transitionProgress += (target - transitionProgress) * transitionSpeed;

    // Environment
    const currentColor = new THREE.Color().copy(colors.daySky).lerp(colors.nightSky, transitionProgress);
    renderer.setClearColor(currentColor);
    scene.fog.color.copy(currentColor);

    // Lights
    ambientLight.color.copy(colors.dayAmbient).lerp(colors.nightAmbient, transitionProgress);
    ambientLight.intensity = 0.6 - (transitionProgress * 0.3); // Softer ambient
    
    directionalLight.color.copy(colors.dayDir).lerp(colors.nightDir, transitionProgress);
    directionalLight.intensity = 0.8 - (transitionProgress * 0.5); // Softer directional to avoid white-out

    // Orbiting Sun & Moon Math (ELEVATOR STYLE)
    // Berada di koordinat tetap di atas layar belakang agar SELALU TERLIHAT jelas
    // Posisi X diubah ke kanan (X = 90) agar tidak tertutup teks di sebelah kiri.
    const celestialX = 90;
    const celestialZ = -150; 
    
    // Y tertinggi adalah 65 (terlihat di langit). Y terendah adalah -30 (tersembunyi di bawah tanah).
    // Sun turun saat progress bergerak dari 0 ke 1.
    const sunY = 65 - (transitionProgress * 150);
    sunMesh.position.set(celestialX, sunY, celestialZ);
    directionalLight.position.copy(sunMesh.position);
    
    // Moon naik saat progress bergerak dari 0 ke 1.
    const moonY = -85 + (transitionProgress * 150);
    moonMesh.position.set(celestialX, moonY, celestialZ);

    // Emissive intensities
    windowMaterials.forEach(m => { m.emissiveIntensity = transitionProgress * 3.0; });
    houseLightMaterials.forEach(m => { m.emissiveIntensity = transitionProgress * 4.0; });
    streetLightMaterials.forEach(m => { m.emissiveIntensity = transitionProgress * 6.0; });

    trafficLights.forEach(t => { t.mat.opacity = 0.1 + (transitionProgress * 0.9); });
    
    // Bloom strength interpolates dynamically
    bloomPass.strength = 0.2 + (transitionProgress * 1.5);
}

function animateTraffic() {
    trafficLights.forEach(t => {
        const positions = t.sys.geometry.attributes.position.array;
        for(let i=0; i<positions.length/3; i++) {
            const dir = t.dirs[i];
            
            // X axis movement (Horizontal Road)
            if (dir.x !== 0) {
                positions[i*3] += dir.x;
                if (positions[i*3] > 200) positions[i*3] = -200;
                if (positions[i*3] < -200) positions[i*3] = 200;
            }
            
            // Z axis movement (Vertical Road driving south)
            if (dir.z !== 0) {
                positions[i*3+2] += dir.z;
                if (positions[i*3+2] > 330) {
                    positions[i*3+2] = 35; // Loop back to highway
                }
            }
        }
        t.sys.geometry.attributes.position.needsUpdate = true;
    });
}

// ==========================================
// ANIMATION LOOP
// ==========================================
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    
    const time = clock.getElapsedTime();

    // Cinematic drifting
    camera.position.x = Math.sin(time * 0.05) * 40;
    camera.position.z = 210 + Math.cos(time * 0.05) * 20;
    camera.position.y = 80 + Math.sin(time * 0.08) * 5; // Slightly lower camera to appreciate rooflines
    camera.lookAt(0, 15, -15); // Look slightly behind center to focus on building

    // Celestial Bodies Rotations
    sunMesh.rotation.z -= 0.002; // Sun slowly spins natively continuously

    animateTraffic();
    updateLightingAndMaterials();
    composer.render();
}

animate();

// ==========================================
// RESIZE
// ==========================================
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});
