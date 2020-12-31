"use strict";
class SceneObject {
    constructor(pos, visible = true) {
        this.pos = pos;
        this.visible = visible;
    }
    setVisibility(b) {
        this.visible = b;
    }
    isVisible() {
        return this.visible;
    }
}
class CelestialBody extends SceneObject {
    constructor(pos, mass, radius) {
        super(pos);
        this.mass = mass;
        this.radius = radius;
    }
}
class CSM extends SceneObject {
    constructor(pos, mass) {
        super(pos);
        this.mass = mass;
    }
}
class Scene {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.sceneObjects = [];
    }
    addSceneObject(obj) {
        this.sceneObjects.push(obj);
    }
    removeSceneObject(idx) {
        this.sceneObjects.splice(idx, 1);
    }
    resize() {
        // update canvas
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // update scene object coordinates
        // TODO: update coordinates for all scene objects based on new width and height
        // redraw
        this.draw();
    }
    draw() {
        // clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        // TODO: draw every SceneObject in object list to canvas
        // for (let obj of this.sceneObjects) {
        //     if (obj.isVisible()) {
        //     }
        // }
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(this.canvas.width / 2 + (Math.random() * 10), this.canvas.height / 2 + (Math.random() * 10), 150, 100);
    }
}
function gameLoop(scene) {
    // window.requestAnimationFrame(function(){gameLoop(scene)});
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
        window.addEventListener('resize', function () { scene.resize(); }, false);
        window.addEventListener('orientationchange', function () { scene.resize(); }, false);
        scene.resize();
        // begin loop
        window.requestAnimationFrame(function () { gameLoop(scene); });
    }
    else {
        // TODO: display message for browsers where canvas is not supported
    }
}
//# sourceMappingURL=index.js.map