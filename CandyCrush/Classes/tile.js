class Tile {
    constructor(game, tileId, x, y) {
        this.game = game;
        this.tileId = tileId;
        this.x = x;
        this.y = y;
        this.currentTransition = null;
    }

    moveTo(x, y, speed) {
        if (this.x == x & this.y == y) return;

        if (speed) {
            let transition = new Transition(this.x, this.y, x, y);
            transition.setTransitionSpeed(speed);
            this.currentTransition = transition;
            this.currentTransition.start();
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
                this.currentTransition = null;
            } else {
                ctx.fillRect(currentPosition[0] * this.game.style.tileWidth, currentPosition[1] * this.game.style.tileWidth, this.game.style.tileWidth, this.game.style.tileWidth);
                return;
            }
        } 

        ctx.fillRect(this.x * this.game.style.tileWidth, this.y * this.game.style.tileWidth, this.game.style.tileWidth, this.game.style.tileWidth);
    }
}
