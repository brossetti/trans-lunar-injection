//====== Constants ======//
const TAU = 2 * Math.PI;
const R_EARTH = 6371;               //volumetric mean radius of the Earth (km)
const R_MOON = 1737.4;              //volumetric mean radius of the Moon (km)
const ALT_CSM = 1850;                //initial altitude of the CSM above the Earth (km)
const DIST_EARTH_TO_MOON = 40000;   //distance from Earth to Moon relative to Earth's radius (not actual, compressed to fit screen)
const GMm_EARTH = 1.14805e10;       //pre-computed GMm for force eq. F=GMm/r^2 (kg*km^3/s^2)
const GMm_MOON = 1.4121e8;          //pre-computed GMm for force eq. F=GMm/r^2 (kg*km^3/s^2)
const MASS_CSM = 28801;             //mass of the CSM (KG)
const ELAPSED = 20;

//===== Game Objects =====//
const scene = {
    originX: 0,
    originY: 0,
    pxpkm: 0
}

const earth = {
    x: 0,
    y: 0,
    r: 0,
    GMm: 0
}

const moon = {
    x: 0,
    y: 0,
    r: 0,
    GMm: 0
}

const csm = {
    x: 0,
    y: 0,
    angle: 0,  //angle relative to vertical (radians)
    vx: 0,     //velocity in x direction (km/s)
    vy: 0,     //velocity in y direction (km/s)
    Fx: 0,     //force in x direction (kg*km/s^2)
    Fy: 0,     //force in y direction (kg*km/s^2)
}

//========= Main =========//
const canvas = document.getElementById('space');

// check for canvas
if (!canvas.getContext) {
    // TODO: display message for browsers where canvas is not supported
    throw new Error('Browser does not support a canvas');
}

// get context
let ctx = canvas.getContext('2d');

// handle canvas sizing
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize)
resize();

// begin game loop
// window.requestAnimationFrame(gameLoop);
setInterval(gameLoop,ELAPSED);

//======= Functions ======//
// calculates the Euclidean distance and angle of line defined by two Cartesian coordinates
function calcDistAndAngle(x1, y1, x2, y2) {
    let x = x1 - x2;
    let y = y1 - y2;

    return [Math.hypot(x,y), Math.atan2(y,x)];
}

// computes the component forces due to gravity
function calcFxFy(r, theta, GMm) {
    let Fx = -GMm * Math.cos(theta) / r**2;
    let Fy = -GMm * Math.sin(theta) / r**2;

    return [Fx, Fy];
}

// updates forces acting on the CSM
function updateForces() {
    let r, theta;
    let Fx, Fy;

    // gravity from Earth
    [r, theta] = calcDistAndAngle(csm.x, csm.y, earth.x, earth.y);
    [Fx, Fy] = calcFxFy(r, theta, earth.GMm);
    csm.Fx = Fx;
    csm.Fy = Fy;

    // gravity from Moon
    [r, theta] = calcDistAndAngle(csm.x, csm.y, moon.x, moon.y);
    [Fx, Fy] = calcFxFy(r, theta, moon.GMm);
    csm.Fx += Fx;
    csm.Fy += Fy;
}

// updates CSM position based on velocity and time elapsed
function updateCSMPosition() {
    csm.vx += (csm.Fx / MASS_CSM) * ELAPSED;
    csm.vy += (csm.Fy / MASS_CSM) * ELAPSED;
    csm.x += csm.vx * ELAPSED;
    csm.y += csm.vy * ELAPSED;


    if (csm.x > canvas.width) {
        csm.x %= canvas.width;
    } else if (csm.x < 0) {
        csm.x = csm.x % canvas.width + canvas.width;
    }

    if (csm.y > canvas.height) {
        csm.y %= canvas.height;
    } else if (csm.y < 0) {
        csm.y = csm.y % canvas.height + canvas.height;
    }    
}

function updateMetrics() {
    document.getElementById("fx").innerText = csm.Fx.toFixed(4);
    document.getElementById("fy").innerText = csm.Fy.toFixed(4);
    document.getElementById("vx").innerText = csm.vx.toFixed(4);
    document.getElementById("vy").innerText = csm.vy.toFixed(4);
}

function draw() {
    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw earth
    ctx.fillStyle = 'green';
    ctx.beginPath();
    ctx.arc(earth.x, earth.y, earth.r, 0, TAU);
    ctx.fill();

    // draw moon
    ctx.fillStyle = 'grey';
    ctx.beginPath();
    ctx.arc(moon.x, moon.y, moon.r, 0, TAU);
    ctx.fill();

    // draw CSM
    ctx.fillStyle = 'white';
    ctx.fillRect(csm.x-5, csm.y-10, 10, 20);
}

// updates canvas when resized or orientation changed
function resize() {
    // update canvas and origin
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scene.originX = canvas.width/2;
    scene.originY = canvas.height/2;

    // set km/px and calculate size of objects
    scene.pxpkm = Math.min(canvas.width, canvas.height) / 45000;
    earth.r = R_EARTH * scene.pxpkm;
    moon.r = R_MOON * scene.pxpkm;

    // set GMm in pixels
    earth.GMm = GMm_EARTH * scene.pxpkm**3;
    moon.GMm = GMm_MOON * scene.pxpkm**3;

    // determine new earth and moon positions
    const diag = Math.sqrt(canvas.width**2 + canvas.height**2);
    const radialOffset = DIST_EARTH_TO_MOON * scene.pxpkm / 2;
    const offsetX = radialOffset / diag * canvas.width;
    const offsetY = radialOffset / diag * canvas.height;

    // set Earth, Moon, and CSM positions
    earth.x = scene.originX - offsetX + earth.r;
    earth.y = scene.originY + offsetY - earth.r;

    moon.x = scene.originX + offsetX - moon.r;
    moon.y = scene.originY - offsetY + moon.r;

    const csmR = earth.r + (ALT_CSM * scene.pxpkm);
    csm.y = earth.y - csmR;
    csm.x = earth.x;

    // set initial CSM velocity
    csm.vx = - Math.sqrt(earth.GMm / MASS_CSM / csmR);
    csm.vy = 0; 

    // redraw
    draw();
}

// runs the game
function gameLoop() {
    updateForces();
    updateCSMPosition();
    updateMetrics();
    draw();
}