const PriorityQueue = require("updatable-priority-queue");
const {Point} = require("./geom");
export const kTioxColors = ['rgb(28, 62, 203)',
    'rgb(80, 212, 146)', 'rgb(151, 78, 224)',
    'rgb(234, 27, 234)', 'rgb(164, 132, 252)', 'rgb(29, 157, 127)',
    'rgb(74, 26, 204)', 'rgb(6, 190, 234)',
    'rgb(206, 24, 115)', 'rgb(0, 0, 0)']
export class Simulation {
    constructor() {
        this.queue = new PriorityQueue()
        this.actors = new Set()
        this.time = 0
    }

    elapse(time) {
        while (true) {
            let next = this.queue.peek();
            if (next && next.item.wake < time) {
                next = next.item
                let elapse = next.wake
                if (elapse < this.time) {
                    elapse = this.time
                }
                this.time = elapse
                next.wake = Number.POSITIVE_INFINITY
                next.elapse(elapse, true)
            } else {
                break;
            }
        }
        for (let x of this.actors) {
            console.assert(x.wake >= time)
        }
        for (let actor of this.actors) {
            actor.elapse(time, false)
        }
        this.time = time
    }
}

export class Actor {
    constructor(sim) {
        this.sim = sim
        this._wake = Number.POSITIVE_INFINITY
        sim.queue.insert(this, this._wake)
        sim.actors.add(this)
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

    set wake(time) {
        console.assert(!isNaN(time))
        this._wake = time
        this.sim.queue.updateKey(this, time)
    }

    get wake() {
        return this._wake
    }

    cancel() {
        this.sim.queue.updateKey(this, Number.NEGATIVE_INFINITY)
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

export class Node extends Actor {
    constructor(sim) {
        super(sim)
        this.pos = new Point(10, 10)
        this.products = new Set()
    }

    layout(pos) {
        this.pos = pos
    }

    elapse(time, wake) {
        if (wake) {
            let progress = false
            if (this.producer) {
                let item = this.producer.peekProduce()
                console.assert(this.consumer, this)
                if (item && this.consumer.peekConsume(item)) {
                    item.owner = this.consumer
                    this.producer.produce(item)
                    this.consumer.consume(item)
                    this.wake = Number.NEGATIVE_INFINITY
                    return
                }
            }
            let old = this.products
            this.products = new Set()
            for (let item of old) {
                if (this.consumer.peekConsume(item)) {
                    item.owner = this.consumer
                    this.consumer.consume(item)
                    this.wake = Number.NEGATIVE_INFINITY
                    return
                }
            }
        }
    }

    poke() {
        this.wake = Number.NEGATIVE_INFINITY
    }

    consume(item) {
        this.products.add(item)
        this.wake = Number.NEGATIVE_INFINITY
    }

    paint(ctx) {
        ctx.beginPath()
        ctx.arc(this.pos.x, this.pos.y, 2, 0, 2 * Math.PI, false)
        ctx.fill()
    }
}