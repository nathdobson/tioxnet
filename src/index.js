import "./index.css"
import {GammaDist} from "./random.js"
import {Point, Rectangle} from "./geom.js"
import {makeSimulation, kStageWidth, kStageHeight} from "./simulation.js"
import {Actor, Item, PaintLayer, Simulation} from "./base.js"

let jStat = require('jstat');


class Animation {
    constructor(canvas) {
        this.canvas = canvas
        this.devicePixelRatio = window.devicePixelRatio || 1;
        this.sim = makeSimulation()
    }

    revalidate() {
        let rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * this.devicePixelRatio;
        this.canvas.height = rect.height * this.devicePixelRatio;
        this.ctx = this.canvas.getContext("2d");
        let hRatio = this.canvas.width / kStageWidth;
        let vRatio = this.canvas.height / kStageHeight;
        if (hRatio < vRatio) {
            this.ctx.translate(0, this.canvas.height / 2)
            this.ctx.scale(hRatio, hRatio);
            this.ctx.translate(0, -kStageHeight / 2)
        } else {
            this.ctx.translate(this.canvas.width / 2, 0)
            this.ctx.scale(vRatio, vRatio);
            this.ctx.translate(-kStageWidth / 2, 0)
        }
        this.ctx.beginPath()
        this.ctx.rect(0, 0, kStageWidth, kStageHeight)
        this.ctx.clip()
    }

    repaint() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.beginPath()
        this.ctx.moveTo(5, 5);
        this.ctx.rect(5, 5, kStageWidth - 10, kStageHeight - 10)
        this.ctx.stroke();
        let byLayer = PaintLayer.enumValues.map(_ => new Set())
        let remaining = new Set(this.sim.actors)
        for (let actor of this.sim.actors) {
            let reorder = actor.reorder();
            if (reorder) {
                for (let ordered of reorder) {
                    if (remaining.has(ordered)) {
                        remaining.delete(ordered)
                        byLayer[ordered.layer.enumOrdinal].add(ordered)
                    }
                }
            }
        }
        for (let unordered of remaining) {
            console.assert(unordered.layer, unordered.constructor.name)
            byLayer[unordered.layer.enumOrdinal].add(unordered)
        }
        byLayer[PaintLayer.NO_PAINT.enumOrdinal] = new Set()
        for (let layer of byLayer) {
            for (let actor of layer) {
                this.ctx.save()
                actor.paint(this.ctx)
                this.ctx.restore()
            }
        }
    }

    elapse(time) {
        this.sim.elapse(time)
    }
}


let anim = new Animation(document.getElementById("rootCanvas"))
anim.revalidate();
anim.repaint();

let time = 0
let fps = 32
window.setInterval(() => {
    anim.elapse(time);
    time += 1.0 / fps
    anim.repaint();
}, 1000 / fps);


window.addEventListener('resize', function () {
    anim.revalidate();
    anim.repaint();
}, false);

