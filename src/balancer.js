import {Actor} from "./base";

export class Balancer extends Actor {
    constructor(sim, inputs, outputs) {
        super(sim)
        this.inputs = inputs
        this.outputs = outputs
        for (let input of inputs) {
            input.consumer = this
        }
        for (let output of outputs) {
            output.producer = this
        }
        this.peekedInput = null
        this.peekedOutput = null
    }

    peekProduce() {
        for (let input of this.inputs) {
            let peek = input.producer.peekProduce()
            if (peek) {
                this.peekedInput = input
                return peek
            }
        }
        return null
    }

    produce(item) {
        this.peekedInput.producer.produce(item)
        this.peekedInput = null
    }

    peekConsume(item) {
        for (let output of this.outputs) {
            if (output.consumer.peekConsume(item)) {
                this.peekedOutput = output
                return true
            }
        }
    }

    consume(item) {
        this.peekedOutput.consume(item)
        this.peekedOutput = null
    }

}