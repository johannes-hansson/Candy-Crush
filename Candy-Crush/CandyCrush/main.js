const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d')


class StyleSettings {
    constructor() {
        this.tileWidth = 40;
        this.borderWidth = 0.5;
        this.borderColor = '#000000';
        this.transitionSpeed = 7;

        this.tileColors = {
            1: 'green',
            2: 'red',
            3: 'blue',
            4: 'magenta'
            // 5: 'orange',
            // 6: 'yellow',
            // 7: 'aquamarine',
            // 8: 'blanchedalmond'
        }
    }
}


class Game {
    constructor() {
        this.style = new StyleSettings();
        this.board = new Board(this);

        this.minCombo = 3;

        // Info for tile switching
        this.mouseDown = false;
        this.lastPositionClicked = null;

        let that = this;
        canvas.addEventListener('mousedown', function(event) {
            that.onMouseDown(event);
        });
        canvas.addEventListener('mouseup', function(event) {
            that.onMouseUp(event);
        })

        // Manage active transitions
        this.activeTransitions = [];
        this.onTransitionsFinishedTempEvents = [];
        this.onTransitionsFinishedEvents = [];
    }

    getWidth() {
        return this.board.width * this.style.tileWidth;
    } 

    getHeight() {
        return this.board.height * this.style.tileWidth;
    }

    init() {
        this.board.init();
        canvas.width = this.getWidth();
        canvas.height = this.getHeight();
    }

    onMouseDown(mouse) {
        if (!this.board.playerCanMove()) return;
        const [x, y] = this.board.getTilePositionFromMouse(mouse);
        if (!this.board.positionIsInBounds(x, y)) return;

        this.mouseDown = true;
        this.lastPositionClicked = [x, y];
    }

    onMouseUp(mouse) {
        this.mouseDown = false;
        const [x, y] = this.board.getTilePositionFromMouse(mouse);
        if (!this.board.positionIsInBounds(x, y)) return;
        if (!this.lastPositionClicked) return;

        const lastX = this.lastPositionClicked[0]
        const lastY = this.lastPositionClicked[1];

        const BOTH_POSITIONS_HAVE_TILES = (this.board.getTileAt(lastX, lastY) != null && this.board.getTileAt(x, y) != null);
        const TILES_ARE_CLOSE = (Math.abs(x - this.lastPositionClicked[0]) + Math.abs(y - this.lastPositionClicked[1])) == 1;
        const PLAYER_CAN_MOVE = this.board.playerCanMove();
        if (BOTH_POSITIONS_HAVE_TILES && TILES_ARE_CLOSE && PLAYER_CAN_MOVE) {
            let tile1 = this.board.getTileAt(lastX, lastY);
            let tile2 = this.board.getTileAt(x, y);

            // Check if the move results in a combo
            let boardCopy = this.board.generateBoardCopy();
            boardCopy.switchTiles(lastX, lastY, x, y);
            let resultingCombos = boardCopy.getAllCombos();
            const SWITCH_RESULTS_IN_COMBO = resultingCombos[0].concat(resultingCombos[1]).length > 0;

            if (SWITCH_RESULTS_IN_COMBO) {
                this.board.switchTiles(this.lastPositionClicked[0], this.lastPositionClicked[1], x, y);
            } else {
                tile1.attemptMove(x, y, this.style.transitionSpeed);
                tile2.attemptMove(lastX, lastY, this.style.transitionSpeed);
            }
        }
        this.lastPositionClicked = null;
    }

    render() {
        this.board.render();
    }

    mainLoop() {
        this.render();

        window.requestAnimationFrame(() => {
            this.mainLoop();
        });
    }

    // Debug
    clickToPlace(mouse, tileId) {
        let rect = canvas.getBoundingClientRect();
        let mouseX = mouse.clientX - rect.left;
        let mouseY = mouse.clientY - rect.top;
        let x = Math.floor(mouseX / this.style.tileWidth);
        let y = Math.floor(mouseY / this.style.tileWidth);

        this.setTile(tileId, x, y);
        this.dropTiles();
    }
}


let game = new Game();
game.init();
game.mainLoop();

// canvas.addEventListener('mousedown', function(event) {
//     game.clickToPlace(event, Math.floor(Math.random() * 2) + 1);
// })

document.addEventListener('keydown', function(event) {
    if (event.key != 'd') return;

    let interval;
    let x = 0;
    interval = setInterval(function() {
        game.board.setTile(Math.floor(Math.random() * Object.keys(game.style.tileColors).length) + 1, x, 0);
        game.board.dropTiles();
        x++;
        if (x >= game.board.width) {
            clearInterval(interval);
        }
    }, 30);
});
