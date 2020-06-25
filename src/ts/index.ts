interface SceneObject {

}

class Scene {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    // private objects: Array<SceneObject>;

    constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    public addSceneObject(obj: SceneObject) {
        // TODO: add scene object to list

    }

    public resize(width: number, height: number) {
        this.canvas.width = width;
        this.canvas.height = height;

        // TODO: update coordinates for all scene objects based on new width and height
    }

    public draw() {
        // TODO: draw every SceneObject in object list to canvas
        this.ctx.fillStyle = 'green';
        this.ctx.fillRect(10,10,150,100);
    }


}

class CelestialBody {
    public mass: number;
    public radius: number;
    public pos: [number, number];

    constructor(mass: number, radius: number, pos: [number, number]) {
        this.mass = mass;
        this.radius = radius;
        this.pos = pos;
    }

}

class CSM {
    public mass: number;
    public pos: [number, number];

    constructor(mass: number, pos: [number, number]) {
        this.mass = mass;
        this.pos = pos;
    }

}

function resizeCanvas(scene: Scene) {
    // recalculate positions of objects in the scene
    scene.resize(window.innerWidth, window.innerHeight);

    // redraw scene
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
        window.addEventListener('resize', function(){resizeCanvas(scene)}, false);
        window.addEventListener('orientationchange', function(){resizeCanvas(scene)}, false)
        resizeCanvas(scene);
    }
}

// start main function
main()