import {Actor, Simulation, Node, Item} from "./base.js"
import {GammaDistr} from "./random";
import {Balancer} from "./balancer";

const PriorityQueue = require("updatable-priority-queue");
const {Point, Rectangle} = require("./geom");


class Exit extends Actor {
    constructor(sim) {
        super(sim)
        this.input = new Node(sim)
        this.input.consumer = this
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
        this.input.layout(bounds.center())
    }

}

class Arrival extends Actor {
    constructor(sim, delay) {
        super(sim);
        this.wake = 0
        this.output = new Node(sim)
        this.delay = delay
    }

    elapse(time, wake) {
        if (wake) {
            this.wake = time + this.delay.sample()
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
}

class Transit extends Actor {
    constructor(sim, from, to, delay) {
        super(sim)
        this.from = from
        this.to = to
        from.consumer = this
        to.producer = this
        this.delay = delay
    }

    elapseItem(time, item, wake) {
        if (wake) {
            this.to.consume(item)
        } else {
            let f = (this.sim.time - item.start) / (item.wake - item.start)
            item.x = this.from.pos.x * (1 - f) + this.to.pos.x * f
            item.y = this.from.pos.y * (1 - f) + this.to.pos.y * f
        }
    }

    peekProduce() {
        return null
    }

    peekConsume(item) {
        return true
    }

    consume(item) {
        item.start = this.sim.time
        item.wake = this.sim.time + this.delay.sample()
    }

    paint(ctx) {
        ctx.beginPath()
        let from = this.from.pos
        let to = this.to.pos
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

class Jump extends Actor {
    constructor(sim, input, output) {
        super(sim)
        this.input = input
        this.output = output
        this.input.consumer = this
        this.output.producer = this
    }

    peekProduce() {
        return this.input.producer.peekProduce()
    }

    produce(item) {
        this.input.producer.produce(item)
    }

    peekConsume(item) {
        return this.output.consumer.peekConsume(item)
    }

    consume(item) {
        this.output.consume(item)
    }
}

class Machine extends Actor {
    constructor(sim, cores, queue) {
        super(sim)
        this.cores = cores
        this.queue = queue
        for (let core of cores) {
            core.machine = this
        }
        queue.machine = this
        let inputs = [queue.output]
        let outputs = this.cores.map(x => x.input)
        new Balancer(sim, inputs, outputs)
    }

    paint(ctx) {
        ctx.beginPath()
        ctx.rect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height)
        ctx.stroke();
    }

    layout(bounds) {
        this.bounds = bounds
        let fraction = 0.5
        this.queue.layout(bounds.hFraction(0, 0.25).removeMargin(kMargin).vCenter(20))
        for (let i = 0; i < this.cores.length; i++) {
            this.cores[i].layout(
                bounds.hFraction(0.25, 1.0)
                    .vFraction(i / this.cores.length, (i + 1) / this.cores.length)
                    .removeMargin(3))

        }
    }
}

class Core extends Actor {
    constructor(sim, delay) {
        super(sim)
        this.output = new Node(sim)
        this.input = new Node(sim)
        this.input.consumer = this
        this.output.producer = this
        this.current = null
        this.delay = delay
    }

    peekConsume(item) {
        return this.current === null
    }

    peekProduce() {
        return null
    }

    elapseItem(time, item, wake) {
        if (wake) {
            this.output.consume(this.current)
            this.current = null
            this.input.poke()
        } else {
            let f = (this.sim.time - item.start) / (item.wake - item.start)
            item.x = this.bounds.x + this.bounds.width * f
            item.y = this.bounds.y + this.bounds.height / 2
        }
    }

    consume(item) {
        console.assert(this.current === null)
        this.current = item
        item.start = this.sim.time
        item.wake = this.delay.sample() + this.sim.time
    }

    layout(bounds) {
        this.bounds = bounds
        this.input.layout(new Point(this.bounds.x, this.bounds.y + this.bounds.height / 2))
        this.output.layout(new Point(this.bounds.x2, this.bounds.y + this.bounds.height / 2))
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
        this.input = new Node(sim)
        this.input.consumer = this
        this.output = new Node(sim)
        this.output.producer = this
        this.queue = []
    }

    peekConsume(item) {
        return true
    }

    consume(item) {
        this.queue.push(item)
        this.output.poke()
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
    }

    elapse(time, wake) {
        for (let i = 0; i < this.queue.length; i++) {
            this.queue[i].x = this.bounds.x2 - 15 * i - this.bounds.height / 2;
            this.queue[i].y = this.bounds.y + this.bounds.height / 2;
        }
    }

    layout(bounds) {
        this.bounds = bounds
        this.input.layout(new Point(bounds.x, bounds.center().y))
        this.output.layout(new Point(bounds.x2, bounds.center().y))
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
    let sim = new Simulation()
    let bounds = new Rectangle(0, 0, kStageWidth, kStageHeight)
    bounds = bounds.removeMargin(kMargin)
    let cores = []
    for (let i = 0; i < 10; i++) {
        cores.push(new Core(sim, GammaDistr.fromRateCV(1.0, 0.0)))
    }
    let queue = new Queue(sim)
    let machine = new Machine(sim, cores, queue)
    machine.layout(bounds.vFraction(0.2, 0.7).hFraction(0.1, 0.9))
    let arrival = new Arrival(sim, GammaDistr.fromRateCV(1.0, 0.0))
    arrival.layout(bounds.hFraction(0.0, 0.1).vFraction(0.0, 0.1))
    let request = new Transit(sim, arrival.output, queue.input, GammaDistr.fromMeanCV(1.0, 0.0))
    let exit = new Exit(sim)
    exit.layout(bounds.hFraction(0.9, 1.0).vFraction(0.0, 0.1))
    let response = new Transit(sim, cores[0].output, exit.input, GammaDistr.fromMeanCV(1.0, 0.0))

    return sim
}