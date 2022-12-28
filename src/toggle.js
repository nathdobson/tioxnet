import playImage from "./assets/images/play.svg";
import pauseImage from "./assets/images/pause.svg";

export class ToggleButton {
    constructor() {
        this.button = document.createElement("button");
        this.button.className = "toggle-button"
        this.pause = document.createElement("img");
        this.pause.src = pauseImage;
        this.button.appendChild(this.pause)
        this.play = document.createElement("img");
        this.play.src = playImage;
        this.button.appendChild(this.play)
        this.state = false
        this.button.addEventListener("click", (e) => this.toggle())
    }

    toggle() {
        this.state = !this.state
    }

    set state(state) {
        this._state = state;
        if (state) {
            this.pause.className = "toggle-button-on"
            this.play.className = "toggle-button-off"
        } else {
            this.pause.className = "toggle-button-off"
            this.play.className = "toggle-button-on"
        }
    }

    get state() {
        return this._state
    }
}

