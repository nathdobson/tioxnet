let jStat = require('jstat');

export class Distr {
    constructor() {
    }

    sample() {
        throw "abstract"
    }
}

export class GammaDistr extends Distr {
    constructor(mean, cv, shape, scale) {
        super()
        this.mean = mean
        this.cv = cv
        this.shape = shape
        this.scale = scale
    }

    static fromRateCV(rate, cv) {
        let shape = 1 / (cv * cv);
        let scale = 1 / (rate * shape)
        return new GammaDistr(1 / rate, cv, shape, scale)
    }

    static fromMeanCV(mean, cv) {
        let shape = 1 / (cv * cv)
        let scale = mean / shape
        return new GammaDistr(mean, cv, shape, scale)
    }

    sample() {
        if (this.cv < 1e-50) {
            return this.mean
        }
        return jStat.gamma.sample(this.shape, this.scale)
    }
}
