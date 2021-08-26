//====== Constants ======//
const TAU = 2 * Math.PI;
const R_EARTH_REL = 0.15;           //radius of the Earth relative to the smallest canvas dimension
const R_MOON_REL = 0.2727;          //radius of the Moon relative to Earth's radius
const R_CSM_REL = 1.5;             //radius of the CSM from Earth origin relative to Earth's radius
const DIST_EARTH_TO_MOON_REL = 6;   //distance from Earth to Moon relative to Earth's radius (not actual, compressed to fit screen)

//===== Game Objects =====//
const origin = {
    x: 0,
    y: 0
}

const earth = {
    x: 0,
    y: 0,
    GMm: 1.14805e10, //pre-computed GMm for force eq. F=GMm/r^2 (kg*km^3/s^2)
    r: 6371          //volumetric mean radius (km)
}

const moon = {
    x: 0,
    y: 0,
    GMm: 1.4121e8,  //pre-computed GMm for force eq. F=GMm/r^2 (kg*km^3/s^2)
    r: 1737.4       //volumetric mean radius (km)
}

const csm = {
    x: 0,
    y: 0,
    angle: 0,  //angle relative to vertical (radians)
    vx: 0,     //velocity in x direction (km/s)
    vy: 0,     //velocity in y direction (km/s)
    Fx: 0,     //force in x direction (kg*km/s^2)
    Fy: 0,     //force in y direction (kg*km/s^2)
    m: 28801   //mass of csm (kg)
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
window.addEventListener('resize', function(){resize()}, false);
window.addEventListener('orientationchange', function(){resize()}, false)
resize();

// begin game loop
window.requestAnimationFrame(function(){gameLoop()});

//======= Functions ======//

// converts from polar to Cartesian coordinates
function polar2cart(r, theta) {

}

// updates forces acting on the CSM
function updateForces(Fxs, Fys) {

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
    origin.x = canvas.width/2;
    origin.y = canvas.height/2;

    // determine new earth and moon positions
    diag = Math.sqrt(canvas.width**2 + canvas.height**2);
    earth.r = Math.min(canvas.width, canvas.height) * R_EARTH_REL;
    moon.r = earth.r * R_MOON_REL;
    radial_offset = earth.r * DIST_EARTH_TO_MOON_REL / 2;
    x_offset = radial_offset / diag * canvas.width;
    y_offset = radial_offset / diag * canvas.height;

    // set Earth, Moon, and CSM position
    earth.x = origin.x - x_offset + earth.r;
    earth.y = origin.y + y_offset - earth.r;

    moon.x = origin.x + x_offset - moon.r;
    moon.y = origin.y - y_offset + moon.r;

    csm.x = earth.x + (earth.r * R_CSM_REL);
    csm.y = earth.y;

    // redraw
    draw();
}

// runs the game
function gameLoop() {
    // window.requestAnimationFrame(function(){gameLoop(scene)});

    draw();
}