"use strict";
class Scene {
    // private objects: Array<SceneObject>;
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }
    addSceneObject(obj) {
        // TODO: add scene object to list
    }
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        // TODO: update coordinates for all scene objects based on new width and height
    }
    draw() {
        // TODO: draw every SceneObject in object list to canvas
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(10, 10, 150, 100);
    }
}
class CelestialBody {
    constructor(mass, radius, pos) {
        this.mass = mass;
        this.radius = radius;
        this.pos = pos;
    }
}
class CSM {
    constructor(mass, pos) {
        this.mass = mass;
        this.pos = pos;
    }
}
function resizeCanvas(scene) {
    // recalculate positions of objects in the scene
    scene.resize(window.innerWidth, window.innerHeight);
    // redraw scene
    scene.draw();
}
function main() {
    // setting the scene
    const canvas = document.getElementById('space');
    if (canvas.getContext) {
        let ctx = canvas.getContext('2d');
        // build initial scene
        // TODO: define the initial elements of the scene
        let scene = new Scene(canvas, ctx);
        // handle canvas sizing
        window.addEventListener('resize', function () { resizeCanvas(scene); }, false);
        window.addEventListener('orientationchange', function () { resizeCanvas(scene); }, false);
        resizeCanvas(scene);
    }
}
// start main function
main();
//# sourceMappingURL=index.js.map