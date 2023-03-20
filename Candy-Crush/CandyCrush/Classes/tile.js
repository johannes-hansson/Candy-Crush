class Tile {
    constructor(game, tileId, x, y) {
        this.game = game;
        this.tileId = tileId;
        this.x = x;
        this.y = y;
        this.currentTransition = null;
    }

    setTransition(startX, startY, endX, endY, speed, onFinished=()=>{}) {
        let transition = new Transition(startX, startY, endX, endY);
        transition.setTransitionSpeed(speed);
        this.currentTransition = transition;
        this.currentTransition.onFinished = onFinished;
        this.currentTransition.start();
    }

    clearTransition() {
        this.currentTransition = null;
    }

    attemptMove(x, y, speed) {
        if (this.x == x && this.y == y) return;

        this.setTransition(this.x, this.y, x, y, speed);
        this.currentTransition.addOnFinishedCallbackEvent(() => {
            this.setTransition(x, y, this.x, this.y, speed);
        });
    }

    moveTo(x, y, speed) {
        if (this.x == x && this.y == y) return;

        if (speed) {
            this.setTransition(this.x, this.y, x, y, speed);
        }

        this.x = x;
        this.y = y;
    }

    render() {
        ctx.fillStyle = this.game.style.tileColors[this.tileId];

        // Check for active transitions
        if (this.currentTransition) {
            const [currentPosition, transitionFinished] = this.currentTransition.getCurrentPosition();
            if (transitionFinished) {
                this.clearTransition();
            } else {
                ctx.fillRect(currentPosition[0] * this.game.style.tileWidth, currentPosition[1] * this.game.style.tileWidth, this.game.style.tileWidth, this.game.style.tileWidth);
                return;
            }
        } 

        ctx.fillRect(this.x * this.game.style.tileWidth, this.y * this.game.style.tileWidth, this.game.style.tileWidth, this.game.style.tileWidth);
    }
}
