class SceneObject {
    protected pos: [number, number];
    protected visible: boolean;

    constructor(pos: [number, number], visible: boolean = true) {
        this.pos = pos;
        this.visible = visible;
    }

    public setVisibility(b: boolean) {
        this.visible = b;
    }

    public isVisible(): boolean {
        return this.visible;
    }
}

class CelestialBody extends SceneObject{
    public mass: number;
    public radius: number;

    constructor(pos: [number, number], mass: number, radius: number) {
        super(pos);
        this.mass = mass;
        this.radius = radius;
    }

}

class CSM extends SceneObject{
    public mass: number;

    constructor(pos: [number, number], mass: number) {
        super(pos);
        this.mass = mass;
    }

}

class Scene {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private sceneObjects: Array<SceneObject>;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.sceneObjects = <SceneObject[]>[];
    }

    public addSceneObject(obj: SceneObject) {
        this.sceneObjects.push(obj);
    }

    public removeSceneObject(idx: number) {
        this.sceneObjects.splice(idx,1);
    }

    public resize() {
        // update canvas
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // update scene object coordinates
        // TODO: update coordinates for all scene objects based on new width and height

        // redraw
        this.draw();
    }

    public draw() {
        // clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // TODO: draw every SceneObject in object list to canvas
        // for (let obj of this.sceneObjects) {
        //     if (obj.isVisible()) {

        //     }
        // }

        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(this.canvas.width/2+(Math.random()*10),this.canvas.height/2+(Math.random()*10),150,100);
    }


}

function gameLoop(scene: Scene) {
    // window.requestAnimationFrame(function(){gameLoop(scene)});

    scene.draw();
}

function main() {
    // setting the scene
    const canvas = <HTMLCanvasElement> document.getElementById('space');

    if (canvas.getContext) {
        let ctx = <CanvasRenderingContext2D> canvas.getContext('2d');

        // build initial scene
        // TODO: define the initial elements of the scene
        let scene = new Scene(canvas, ctx);

        // handle canvas sizing
        window.addEventListener('resize', function(){scene.resize()}, false);
        window.addEventListener('orientationchange', function(){scene.resize()}, false)
        scene.resize();

        // begin loop
        window.requestAnimationFrame(function(){gameLoop(scene)});

    } else {
        // TODO: display message for browsers where canvas is not supported
    }
}
