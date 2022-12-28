import {Actor, PaintLayer} from "./base.js";

export class ConsumerBalancer extends Actor {
    constructor(sim, outputs) {
        super(sim)
        this.outputs = outputs
        this.peekedOutput = null
        for (let output of outputs) {
            output.onConsume = () => {
                this.onConsume()
            }
        }
        this.layer = PaintLayer.NO_PAINT
    }

    peekConsume(item) {
        for (let output of this.outputs) {
            if (output.peekConsume(item)) {
                this.peekedOutput = output
                return true
            }
        }
    }

    consume(item) {
        if (!this.peekedOutput) {
            console.assert(this.peekConsume(item))
        }
        this.peekedOutput.consume(item)
        this.peekedOutput = null
    }

}