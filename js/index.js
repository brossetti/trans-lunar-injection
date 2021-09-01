//====== Constants ======//
const TAU = 2 * Math.PI;
const R_EARTH = 6371;               //volumetric mean radius of the Earth (km)
const R_MOON = 1737.4;              //volumetric mean radius of the Moon (km)
const W_CSM = 2000;                 //width of CSM (not actual) (km)
const ASPECT_CSM = 0.5;             //aspect ratio of CSM width/height
const ALT_CSM = 1850;               //initial altitude of the CSM above the Earth (km)
const DIST_EARTH_TO_MOON = 45000;   //distance from Earth to Moon relative to Earth's radius (not actual, compressed to fit screen)
const GMm_EARTH = 1.14805e10;       //pre-computed GMm for force eq. F=GMm/r^2 (kg*km^3/s^2)
const GMm_MOON = 1.4121e8;          //pre-computed GMm for force eq. F=GMm/r^2 (kg*km^3/s^2)
const MASS_CSM = 28801;             //mass of the CSM (KG)
const THRUST_MAIN = 91.225;         //thrust of CSM main engine (kg*km/s^2)
const ATTITUDE_STEP = Math.PI/90;   //amount to offset CSM attitude on user input (radians) 
const ELAPSED = 20;

//======= Objects =======//
const scene = {
    originX: 0,
    originY: 0,
    pxpkm: 0,       //conversion from km to pixels 
    tailLength: 75  //max number or previous coordinate to use for tail
}

const earth = {
    x: 0,
    y: 0,
    r: 0,           //radius (px)
    GMm: 0          //GMm for force eq. F=GMm/r^2 (kg*px^3/s^2)
}

const moon = {
    x: 0,
    y: 0,
    r: 0,           //radius (px)
    GMm: 0          //GMm for force eq. F=GMm/r^2 (kg*px^3/s^2)
}

const csm = {
    x: 0,
    y: 0,
    w: 0,           //width of CSM (px)
    h: 0,           //height of CSM (px)
    angle: 0,       //angle relative to vertical (radians)
    angleOffset: 0, //offset angle from RCS (radians)
    thrust: 0,      //trust of CSM main engine (kg*px/s^s)
    vx: 0,          //velocity in x direction (px/s)
    vy: 0,          //velocity in y direction (px/s)
    v: 0,           //velocity (km/h)
    Fx: 0,          //force in x direction (kg*px/s^2)
    Fy: 0,          //force in y direction (kg*px/s^2)
    tailX: [],      //array of tail x coordinates
    tailY: []       //array of tail y coordinates
}

//======== Assets ========//
const imgEarth = new Image();
const imgMoon = new Image();
const imgCSM = new Image();
const imgCSMEngine = new Image();
const imgCSMRCSCW = new Image();
const imgCSMRCSCCW = new Image();
imgEarth.src = './img/earth.png';
imgMoon.src = './img/moon.png';
imgCSM.src = './img/csm.png';
imgCSMEngine.src = './img/csm-engine.png';
imgCSMRCSCW.src = './img/csm-rcs-cw.png';
imgCSMRCSCCW.src = './img/csm-rcs-ccw.png';

//========= Main =========//
const canvas = document.getElementById('space');

// check for canvas
if (!canvas.getContext) {
    // TODO: display message for browsers where canvas is not supported
    throw new Error('Browser does not support a canvas');
}

// get context
let ctx = canvas.getContext('2d');

// setup keyboard controls
let rightPressed = false;   //rotate counter-clockwise
let leftPressed = false;    //rotate clockwise
let upPressed = false;      //main engine thrust
let paused = false;         //start-pause game

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);


// handle canvas sizing
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', resize)
resize();

// begin game loop
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

    // thrust from user input
    if (upPressed) {
        csm.Fx += csm.thrust * Math.cos(csm.angle);
        csm.Fy += csm.thrust * Math.sin(csm.angle);
    }

    // adjust attitude based on user input
    if (rightPressed) {
        csm.angleOffset += ATTITUDE_STEP;
    } else if (leftPressed) {
        csm.angleOffset -= ATTITUDE_STEP;
    } 
}

// updates CSM position based on velocity and time elapsed
function updatePosition() {
    // adjust velocity due to gravity
    csm.vx += (csm.Fx / MASS_CSM) * ELAPSED;
    csm.vy += (csm.Fy / MASS_CSM) * ELAPSED;
    csm.v = Math.hypot(csm.vx, csm.vy) * 3600 / scene.pxpkm;

    // update position
    csm.x += csm.vx * ELAPSED;
    csm.y += csm.vy * ELAPSED;

    // handle boundaries
    if (csm.x > canvas.width) {
        csm.x %= canvas.width;
        csm.tailX = [csm.x];
        csm.tailY = [csm.y];
    } else if (csm.x < 0) {
        csm.x = csm.x % canvas.width + canvas.width;
        csm.tailX = [csm.x];
        csm.tailY = [csm.y];
    }

    if (csm.y > canvas.height) {
        csm.y %= canvas.height;
        csm.tailX = [csm.x];
        csm.tailY = [csm.y];
    } else if (csm.y < 0) {
        csm.y = csm.y % canvas.height + canvas.height;
        csm.tailX = [csm.x];
        csm.tailY = [csm.y];
    }

    // add position to tail
    if (csm.tailX.length > scene.tailLength) {
        csm.tailX.pop();
        csm.tailY.pop();
    }
    csm.tailX.unshift(csm.x);
    csm.tailY.unshift(csm.y);

    // update angle
    if (csm.v < 30) {
        csm.angleOffset = 0;
    }
    csm.angle = csm.angleOffset + Math.atan2(csm.y - csm.tailY[1], csm.x - csm.tailX[1]);
}

// updates on-screen metric display
function updateMetrics() {
    let de = (Math.hypot(earth.x - csm.x, earth.y - csm.y) - earth.r) / scene.pxpkm;
    let dm = (Math.hypot(moon.x - csm.x, moon.y - csm.y) - moon.r) / scene.pxpkm;
    let fx = csm.Fx / scene.pxpkm;
    let fy = csm.Fy / scene.pxpkm;
    document.getElementById("de").innerText = de.toFixed(0);
    document.getElementById("dm").innerText = dm.toFixed(0);
    document.getElementById("v").innerText = csm.v.toFixed(0);
    document.getElementById("fx").innerText = fx.toFixed(0);
    document.getElementById("fy").innerText = fy.toFixed(0);
}

// draws objects on canvas
function draw() {
    // clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // draw earth
    ctx.drawImage(imgEarth, earth.x - earth.r, earth.y - earth.r, earth.r*2, earth.r*2);

    // draw moon
    ctx.drawImage(imgMoon, moon.x - moon.r, moon.y - moon.r, moon.r*2, moon.r*2);

    // set tail gradient
    let tailGradient = ctx.createLinearGradient(csm.x, csm.y, csm.tailX[csm.tailX.length - 1],  csm.tailY[csm.tailY.length - 1]);
    tailGradient.addColorStop("0", "rgba(255,255,255,1)");
    tailGradient.addColorStop("1.0", "rgba(255,255,255,0)");

    // draw CSM tail
    ctx.strokeStyle = tailGradient;
    ctx.beginPath();
    ctx.moveTo(csm.x, csm.y);
    csm.tailX.forEach((coordX,i) => {
        const coordY = csm.tailY[i];
        ctx.lineTo(coordX,coordY);
    });
    ctx.stroke();

    // draw CSM
    ctx.save();
    ctx.translate(csm.x,csm.y);
    ctx.rotate(csm.angle);
    if (upPressed) {
        ctx.drawImage(imgCSMEngine, -csm.w/2, -csm.h/2, csm.w, csm.h);
    }
    if (leftPressed) {
        ctx.drawImage(imgCSMRCSCCW, -csm.w/2, -csm.h/2, csm.w, csm.h);
    }
    if (rightPressed) {
        ctx.drawImage(imgCSMRCSCW, -csm.w/2, -csm.h/2, csm.w, csm.h);
    }
    ctx.drawImage(imgCSM, -csm.w/2, -csm.h/2, csm.w, csm.h);
    ctx.restore();
}

// handles control set on button press
function keyDownHandler(e) {
    switch (e.code) {
        case "Right":
        case "ArrowRight":
        case "KeyD":
            rightPressed = true;
            break;
        case "Left":
        case "ArrowLeft":
        case "KeyA":
            leftPressed = true;
            break;
        case "Up":
        case "ArrowUp":
        case "KeyW":
            upPressed = true;
            break;
        case "Space":
            paused = !paused;
            document.getElementById("banner").hidden = !paused;
            break;
    }
}

// handles control reset on button release
function keyUpHandler(e) {
    switch (e.code) {
        case "Right":
        case "ArrowRight":
        case "KeyD":
            rightPressed = false;
            break;
        case "Left":
        case "ArrowLeft":
        case "KeyA":
            leftPressed = false;
            break;
        case "Up":
        case "ArrowUp":
        case "KeyW":
            upPressed = false;
            break;
    }
}

// updates canvas when resized or orientation changed
function resize() {
    // update canvas and origin
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    scene.originX = canvas.width/2;
    scene.originY = canvas.height/2;

    // turn up image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.webkitImageSmoothingEnabled = true;
    ctx.mozImageSmoothingEnabled = true;
    ctx.msImageSmoothingEnabled = true;
    ctx.oImageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // set km/px and calculate size of objects
    scene.pxpkm = Math.min(canvas.width, canvas.height) / 45000;
    earth.r = R_EARTH * scene.pxpkm;
    moon.r = R_MOON * scene.pxpkm;
    csm.w = W_CSM * scene.pxpkm;
    csm.h = csm.w * ASPECT_CSM;

    // set GMm in pixels
    earth.GMm = GMm_EARTH * scene.pxpkm**3;
    moon.GMm = GMm_MOON * scene.pxpkm**3;

    // set thrust in pixels
    csm.thrust = THRUST_MAIN * scene.pxpkm;

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
    csm.x = earth.x;
    csm.y = earth.y - csmR;
    csm.angle = Math.PI;

    // reset tail
    csm.tailX = [csm.x];
    csm.tailY = [csm.y];

    // set initial CSM velocity as v=sqrt(GM/r)
    csm.vx = - Math.sqrt(earth.GMm / MASS_CSM / csmR);
    csm.vy = 0; 

    // redraw
    draw();
}

// runs the game
function gameLoop() {
    if (!paused) {
        updateForces();
        updatePosition();
        updateMetrics();
        draw();
    }
}