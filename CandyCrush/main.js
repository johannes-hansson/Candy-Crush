const canvas = document.getElementById('main-canvas');
const ctx = canvas.getContext('2d')


class StyleSettings {
    constructor() {
        this.tileWidth = 40;
        this.borderWidth = 1;
        this.borderColor = '#000000';
        this.transitionSpeed = 7;

        this.tileColors = {
            1: 'green',
            2: 'red',
            3: 'blue',
            4: 'yellow'
        }
    }
}


class Game {
    constructor() {
        this.style = new StyleSettings();
        this.width = 14;
        this.height = 8;
        this.board;

        this.minCombo = 3;
    }

    getWidth() {
        return this.width * this.style.tileWidth;
    } 

    getHeight() {
        return this.height * this.style.tileWidth;
    }

    generateBoard() {
        let board = [];
        for (let column=0; column<this.width; column++) {
            board[column] = [];
            for (let row=0; row<this.height; row++) {
                board[column][row] = null;
            }
        }
        return board;
    }

    init() {
        this.board = this.generateBoard();
        canvas.width = this.getWidth();
        canvas.height = this.getHeight();
    }

    breakCombo(combo) {
        let that = this;
        combo.forEach((tile) => {
            that.removeTileAt(tile.x, tile.y);
        });
    }

    checkCombosInLine(line) {
        let that = this;
        let currentComboList = [];
        let currentComboType = null;
        let combosFound = [];
        line.forEach((tile) => {
            if (tile) {
                if (!currentComboType || tile.tileId == currentComboType) {
                    currentComboList.push(tile);
                    currentComboType = tile.tileId;
                } else {
                    if (currentComboList.length >= this.minCombo) {
                        combosFound.push(currentComboList);
                    }
                    currentComboList = [];
                    currentComboType = tile.tileId;
                    currentComboList.push(tile);
                }
            }
        });
        if (currentComboList.length >= this.minCombo) {
            combosFound.push(currentComboList);
        }

        return combosFound;
    }

    checkCombos() {
        let that = this;
        let verticalCombos = [];
        let horizontalCombos = [];
        this.board.forEach((column) => {
            verticalCombos = that.checkCombosInLine(column);
        });
        for (let rowIndex=0; rowIndex<this.height; rowIndex++) {
            let tilesInRow = [];
            for (let columnIndex=0; columnIndex<this.width; columnIndex++) {
                tilesInRow.push(this.board[columnIndex][rowIndex]);
            }
            horizontalCombos = that.checkCombosInLine(tilesInRow);
        }

        verticalCombos.forEach((combo) => {
            that.breakCombo(combo);
        });
        horizontalCombos.forEach((combo) => {
            that.breakCombo(combo);
        });
    }

    dropTiles() {
        let that = this;
        this.board.forEach((column) => {
            let bottom = column.length-1;
            for (let tileIndex=column.length-1; tileIndex >= 0; tileIndex--) {
                let tile = column[tileIndex];
                if (tile) {
                    this.moveTileAt(tile.x, tile.y, tile.x, bottom);
                    bottom--;
                }
            }
        });
    }

    setTile(tileId, x, y) {
        let tile = new Tile(this, tileId, x, y)
        game.board[x][y] = tile;
    }

    removeTileAt(x, y) {
        game.board[x][y] = null;
    }

    moveTileAt(startX, startY, endX, endY) {
        let tile = this.board[startX][startY];
        if (!tile) return;

        tile.moveTo(endX, endY, this.style.transitionSpeed);
        this.board[startX][startY] = null;
        this.board[endX][endY] = tile;
    }

    render() {
        ctx.clearRect(0, 0, this.getWidth(), this.getHeight());

        ctx.fillStyle = this.style.borderColor

        for (let verticalLine=1; verticalLine<this.width; verticalLine++) {
            ctx.fillRect(verticalLine * this.style.tileWidth, 0, this.style.borderWidth, this.getHeight());
        }

        for (let horizontalLine=1; horizontalLine<this.height; horizontalLine++) {
            ctx.fillRect(0, horizontalLine * this.style.tileWidth, this.getWidth(), this.style.borderWidth);
        }

        this.board.forEach((row) => {
            row.forEach((tile) => {
                if (tile) {
                    tile.render();
                }
            });
        });
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

canvas.addEventListener('mousedown', function(event) {
    game.clickToPlace(event, Math.floor(Math.random() * 2) + 1);
})

document.addEventListener('keydown', function(event) {
    if (event.key != 'd') return;

    let interval;
    let x = 0;
    interval = setInterval(function() {
        game.setTile(Math.floor(Math.random() * 2) + 1, x, 0);
        game.dropTiles();
        x++;
        if (x >= game.width) {
            clearInterval(interval);
        }
    }, 30);
    game.dropTiles();
});
