export  class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y
    }
}

export class Rectangle {
    constructor(x, y, width, height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    get x2() {
        return this.x + this.width
    }

    get y2() {
        return this.y + this.height
    }

    removeMargin(margin) {
        return new Rectangle(this.x + margin, this.y + margin, this.width - margin * 2, this.height - margin * 2)
    }

    leftFraction(fraction) {
        return new Rectangle(this.x, this.y, this.width * fraction, this.height)
    }

    hFraction(f1, f2) {
        return new Rectangle(this.x + this.width * f1, this.y, this.width * (f2 - f1), this.height)
    }

    vFraction(f1, f2) {
        return new Rectangle(this.x, this.y + this.height * f1, this.width, this.height * (f2 - f1))
    }

    center() {
        return new Point(this.x + this.width / 2, this.y + this.height / 2)
    }

    vCenter(height) {
        return new Rectangle(this.x, this.y + (this.height - height) / 2, this.width, height)
    }
}
