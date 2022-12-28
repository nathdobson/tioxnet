import {Actor, Simulation, Item, Driver, Priority, PaintLayer} from "./base.js"
import {GammaDistr} from "./random.js";
import {ConsumerBalancer} from "./balancer.js";

const {Point, Rectangle} = require("./geom");

class Exit extends Actor {
    constructor(sim) {
        super(sim)
        this.layer = PaintLayer.NODE
    }

    paint(ctx) {
        ctx.beginPath()
        ctx.fillStyle = "rgb(230,150,150)"
        ctx.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height)
        ctx.fill()
    }

    peekConsume(item) {
        return true
    }

    consume(item) {
        item.cancel()
    }

    layout(bounds) {
        this.bounds = bounds
    }

    inPos() {
        return new Point(this.bounds.x + this.bounds.width / 2, this.bounds.y + this.bounds.height / 2)
    }

}

class Arrival extends Actor {
    constructor(sim, delay) {
        super(sim);
        this.setWake()
        this.delay = delay
        this.output = null
        this.layer = PaintLayer.NODE
    }

    elapse(time, wake) {
        if (wake) {
            this.setWake(time + this.delay.sample())
            this.output.consume(new Item(this.sim))
        }
    }

    paint(ctx) {
        ctx.beginPath()
        ctx.fillStyle = "rgb(150,230,150)"
        ctx.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height)
        ctx.fill()
    }

    layout(bounds) {
        this.bounds = bounds
        this.output.layout(bounds.center())
    }

    outPos() {
        return new Point(this.bounds.x + this.bounds.width / 2, this.bounds.y + this.bounds.height / 2)
    }
}

class Transit extends Actor {
    constructor(sim, delay) {
        super(sim)
        this.delay = delay
        this.output = null
        this.p1 = null
        this.p2 = null
        this.priority = Priority.TRANSIT
        this.layer = PaintLayer.EDGE
    }

    elapseItem(time, item, wake) {
        if (wake) {
            item.owner = null
            this.output.consume(item)
        } else {
            let f = (this.sim.time - item.start) / (item.getWake() - item.start)
            item.x = this.p1.x * (1 - f) + this.p2.x * f
            item.y = this.p1.y * (1 - f) + this.p2.y * f
        }
    }

    layout(p1, p2) {
        this.p1 = p1
        this.p2 = p2
    }

    peekConsume(item) {
        return true
    }

    consume(item) {
        item.owner = this
        item.start = this.sim.time
        item.setWake(this.sim.time + this.delay.sample(), Priority.TRANSIT)
    }

    paint(ctx) {
        ctx.beginPath()
        let from = this.p1
        let to = this.p2
        let dx = to.x - from.x
        let dy = to.y - from.y
        let f = 5.0 / Math.sqrt(dx * dx + dy * dy)
        dx *= f
        dy *= f
        ctx.moveTo(from.x + dx, from.y + dy)
        ctx.lineTo(to.x - dx, to.y - dy)
        ctx.stroke()
    }
}

class Machine extends Actor {
    constructor(sim, queue, cores) {
        super(sim)
        this.cores = cores
        this.queue = queue
        for (let core of cores) {
            core.machine = this
        }
        queue.machine = this
        new Driver(sim, queue, new ConsumerBalancer(sim, cores))
        this.layer = PaintLayer.MACHINE
        console.assert(this.layer)
    }

    paint(ctx) {
        ctx.beginPath()
        ctx.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height)
        ctx.stroke();
    }

    layout(bounds) {
        this.bounds = bounds
        this.queue.layout(bounds.hFraction(0, 0.5).removeMargin(kMargin).top(20))
        for (let i = 0; i < this.cores.length; i++) {
            this.cores[i].layout(
                bounds.hFraction(0.5, 1.0)
                    .vFraction(i / this.cores.length, (i + 1) / this.cores.length)
                    .removeMargin(3))

        }
    }

    inPos() {
        return new Point(this.bounds.x, this.bounds.y)
    }

    outPos() {
        return new Point(this.bounds.x + this.bounds.width, this.bounds.y)
    }
}

class Core extends Actor {
    constructor(sim, delay) {
        super(sim)
        this.current = null
        this.delay = delay
        this.output = null
        this.priority = Priority.CORE
        this.layer = PaintLayer.NODE
    }

    peekConsume(item) {
        return this.current === null
    }

    consume(item) {
        item.owner = this
        console.assert(this.current === null)
        this.current = item
        item.start = this.sim.time
        item.setWake(this.delay.sample() + this.sim.time, Priority.CORE)
    }

    elapseItem(time, item, wake) {
        if (wake) {
            item.owner = null;
            this.output.consume(this.current);
            this.current = null;
            (this.onConsume)()
        } else {
            let f = (this.sim.time - item.start) / (item.getWake() - item.start)
            item.x = this.bounds.x + this.bounds.width * f
            item.y = this.bounds.y + this.bounds.height / 2
        }
    }

    layout(bounds) {
        this.bounds = bounds
    }

    paint(ctx) {
        ctx.beginPath()
        ctx.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height)
        if (this.current) {
            ctx.fillStyle = "rgb(255,150,150)"
        } else {
            ctx.fillStyle = "rgb(150,255,150)"
        }
        ctx.fill()
        ctx.stroke()
    }
}

class Queue extends Actor {
    constructor(sim) {
        super(sim)
        this.queue = []
        this.layer = PaintLayer.NODE
        this.maxVisible = 30
        this.maxSpaced = 15
        this.hiddenFraction = 0.3
    }

    peekConsume(item) {
        return true
    }

    consume(item) {
        item.owner = this
        this.queue.push(item);
        (this.onProduce)()
    }

    peekProduce() {
        if (this.queue.length === 0) {
            return null
        } else {
            return this.queue[0]
        }
    }

    produce(item) {
        console.assert(this.peekProduce() === item)
        this.queue.shift()
        item.owner = null
    }

    elapse(time, wake) {
        if (this.queue.length <= this.maxVisible) {
            let slots = Math.max(this.queue.length, this.maxSpaced)
            for (let i = 0; i < this.queue.length; i++) {
                this.place(this.queue[i], i, slots)
            }
        } else {
            let left = Math.ceil(this.maxVisible * (1 - this.hiddenFraction) / 2)
            let right = Math.floor(this.maxVisible * (1 - this.hiddenFraction) / 2)
            for (let i = 0; i < left; i++) {
                this.place(this.queue[i], i, this.maxVisible)
            }
            for (let i = this.queue.length - right; i < this.queue.length; i++) {
                let k = i - this.queue.length + this.maxVisible
                this.place(this.queue[i], k, this.maxVisible)
            }
        }
    }

    place(item, index, slots) {
        let fraction = index / (slots - 1)
        item.x = this.start.x * (1 - fraction) + this.end.x * fraction
        item.y = this.start.y * (1 - fraction) + this.end.y * fraction
    }

    layout(bounds) {
        this.bounds = bounds
        this.start = new Point(this.bounds.x2 - this.bounds.height / 2, this.bounds.y + this.bounds.height / 2)
        this.end = new Point(this.bounds.x + this.bounds.height / 2, this.bounds.y + this.bounds.height / 2)
    }


    paint(ctx) {
        ctx.beginPath()
        ctx.moveTo(this.bounds.x, this.bounds.y)
        ctx.lineTo(this.bounds.x2, this.bounds.y)
        ctx.lineTo(this.bounds.x2, this.bounds.y2)
        ctx.lineTo(this.bounds.x, this.bounds.y2)
        ctx.stroke()
        if (this.queue.length > this.maxVisible) {
            let center = this.bounds.center()
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText("..." + this.queue.length + "...", center.x, center.y)
        }
    }

    reorder() {
        return this.queue.slice().reverse()
    }

    hides() {
        if (this.queue.length > this.maxVisible) {
            let left = Math.ceil(this.maxVisible * (1 - this.hiddenFraction) / 2)
            let right = Math.floor(this.maxVisible * (1 - this.hiddenFraction) / 2)
            return this.queue.slice(left, this.queue.length - right)
        }
    }
}

export let kStageWidth = 500
export let kStageHeight = 400
export let kMargin = 10

export function makeSimulation() {
    let arrivalDistr = GammaDistr.fromRateCV(10.0, 1.0)
    let requestDistr = GammaDistr.fromMeanCV(1.0, 1.0)
    let coreDistr = GammaDistr.fromRateCV(0.1, 1.0)
    let responseDistr = GammaDistr.fromMeanCV(1.0, 1.0)

    let sim = new Simulation()
    let arrival = new Arrival(sim, arrivalDistr)
    let request = new Transit(sim, requestDistr)
    let queue = new Queue(sim)
    let cores = []
    for (let i = 0; i < 10; i++) {
        cores.push(new Core(sim, coreDistr))
    }
    let machine = new Machine(sim, queue, cores)
    let response = new Transit(sim, responseDistr)
    let exit = new Exit(sim)
    arrival.output = request
    request.output = queue
    for (let core of cores) {
        core.output = response
    }
    response.output = exit

    let bounds = new Rectangle(0, 0, kStageWidth, kStageHeight)
    bounds = bounds.removeMargin(kMargin)
    machine.layout(bounds.vFraction(0.2, 0.7).hFraction(0.1, 0.9))
    arrival.layout(bounds.hFraction(0.3, 0.4).vFraction(0.0, 0.1))
    exit.layout(bounds.hFraction(0.6, 0.7).vFraction(0.0, 0.1))
    request.layout(arrival.outPos(), machine.inPos())
    response.layout(machine.outPos(), exit.inPos())
    return sim
}