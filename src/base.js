import PriorityQueue from "./heap.js"

const {Point} = require("./geom");
export const kTioxColors = ['rgb(28, 62, 203)',
    'rgb(80, 212, 146)', 'rgb(151, 78, 224)',
    'rgb(234, 27, 234)', 'rgb(164, 132, 252)', 'rgb(29, 157, 127)',
    'rgb(74, 26, 204)', 'rgb(6, 190, 234)',
    'rgb(206, 24, 115)', 'rgb(0, 0, 0)']
let enumify = require('enumify');

export class Priority extends enumify.Enumify {
    static CANCEL = new Priority()
    static CORE = new Priority()
    static TRANSIT = new Priority()
    static DEFAULT = new Priority()
    static _ = this.closeEnum();

    compareTo(other) {
        return this.enumOrdinal - other.enumOrdinal
    }

}

class TimeKey {
    constructor(time, priority) {
        this.time = time
        this.priority = priority
    }

    compareTo(other) {
        if (this.time === other.time) {
            return this.priority.compareTo(other.priority)
        }
        return this.time - other.time
    }
}

export class Simulation {
    constructor() {
        this.queue = new PriorityQueue((a, b) => a.compareTo(b))
        this.actors = new Set()
        this.time = 0
    }

    elapse(time) {
        while (true) {
            let next = this.queue.peek();
            if (next && next.item.getWake() < time) {
                next = next.item
                let elapse = next.getWake()
                if (elapse < this.time) {
                    elapse = this.time
                }
                this.time = elapse
                next.setWake(Number.POSITIVE_INFINITY)
                next.elapse(elapse, true)
            } else {
                break;
            }
        }
        for (let actor of this.actors) {
            console.assert(actor.getWake() >= time)
        }
        for (let actor of this.actors) {
            actor.elapse(time, false)
        }
        this.time = time
    }
}

export class Actor {
    constructor(sim) {
        console.assert(sim instanceof Simulation, sim)
        this.sim = sim
        this._priority = Priority.DEFAULT
        this._wake = Number.POSITIVE_INFINITY
        sim.queue.insert(this, new TimeKey(this._wake, this._priority))
        sim.actors.add(this)
        this.onProduce = null
        this.onConsume = null
    }

    peekProduce() {
        throw ("Abstract peekProduce " + this.constructor.name)
    }

    produce(item) {
        throw ("Abstract produce " + this.constructor.name)
    }

    peekConsume(item) {
        throw ("Abstract peekConsume " + this.constructor.name)
    }

    consume(item) {
        throw ("Abstract consume " + this.constructor.name)
    }

    elapse(time, wake) {
    }

    elapseItem(time, item, wake) {
    }

    setWake(time = Number.NEGATIVE_INFINITY, priority = Priority.DEFAULT) {
        console.assert(!isNaN(time))
        this._wake = time
        this._priority = priority
        this.sim.queue.updateKey(this, new TimeKey(this._wake, this._priority))
    }

    getWake() {
        return this._wake
    }

    getPriority() {
        return this._priority
    }

    cancel() {
        this.sim.queue.updateKey(this, new TimeKey(Number.NEGATIVE_INFINITY, Priority.CANCEL))
        let popped = this.sim.queue.pop()
        console.assert(popped && popped.item === this);
        this.sim.actors.delete(this)
    }

    paint(ctx) {

    }
}

export class Item extends Actor {
    constructor(sim) {
        super(sim);
        this.color = kTioxColors[Math.floor(Math.random() * kTioxColors.length)]
    }

    elapse(time, wake) {
        if (this.owner) {
            this.owner.elapseItem(time, this, wake)
        }
    }

    paint(ctx) {
        ctx.beginPath()
        let size = 10;
        ctx.fillStyle = this.color
        ctx.strokeStyle = "rgb(255,255,255)"
        ctx.rect(this.x - size / 2, this.y - size / 2, size, size)
        ctx.fill()
        ctx.stroke()
    }
}

export class Driver extends Actor {
    constructor(sim, from, to) {
        super(sim)
        this.from = from
        this.to = to
        this.from.onProduce = () => {
            console.assert(this.constructor.name === "Driver")
            this.setWake()
        }
        this.to.onConsume = () => {
            this.setWake()
        }
    }

    elapse(time, wake) {
        if (wake) {
            let item = this.from.peekProduce()
            if (item && this.to.peekConsume(item)) {
                this.from.produce(item)
                this.to.consume(item)
                this.setWake()
            }
        }
    }

    // paint(ctx) {
    //     ctx.beginPath()
    //     ctx.arc(this.pos.x, this.pos.y, 2, 0, 2 * Math.PI, false)
    //     ctx.fill()
    // }
}