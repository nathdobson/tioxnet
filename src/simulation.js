import {Actor, Simulation, Item, Driver, Priority} from "./base.js"
import {GammaDistr} from "./random";
import {ConsumerBalancer} from "./balancer";

const {Point, Rectangle} = require("./geom");


class Exit extends Actor {
    constructor(sim) {
        super(sim)
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
    }

    paint(ctx) {
        ctx.beginPath()
        ctx.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height)
        ctx.stroke();
    }

    layout(bounds) {
        this.bounds = bounds
        let fraction = 0.5
        this.queue.layout(bounds.hFraction(0, 0.25).removeMargin(kMargin).top(20))
        for (let i = 0; i < this.cores.length; i++) {
            this.cores[i].layout(
                bounds.hFraction(0.25, 1.0)
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
        let maxSep = this.bounds.width / this.queue.length;
        let sep = Math.min(15, maxSep)
        for (let i = 0; i < this.queue.length; i++) {
            this.queue[i].x = this.bounds.x2 - sep * i - this.bounds.height / 2;
            this.queue[i].y = this.bounds.y + this.bounds.height / 2;
        }
    }

    layout(bounds) {
        this.bounds = bounds
    }


    paint(ctx) {
        ctx.beginPath()
        ctx.moveTo(this.bounds.x, this.bounds.y)
        ctx.lineTo(this.bounds.x2, this.bounds.y)
        ctx.lineTo(this.bounds.x2, this.bounds.y2)
        ctx.lineTo(this.bounds.x, this.bounds.y2)
        ctx.stroke()
    }
}

export let kStageWidth = 500
export let kStageHeight = 400
export let kMargin = 10

export function makeSimulation() {
    let arrivalDistr = GammaDistr.fromRateCV(1.0, 1.0)
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