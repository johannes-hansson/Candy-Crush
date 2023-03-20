class Board {
    constructor(game) {
        this.game = game;
        this.width = 12;
        this.height = 8;
        this.grid;

        // Manage active transitions
        this.currentTransitionWaitInterval;
        this.currentTransitionFinishedTimeout;
    }

    init() {
        this.grid = [];
        for (let column=0; column<this.width; column++) {
            this.grid[column] = [];
            for (let row=0; row<this.height; row++) {
                this.grid[column][row] = null;
            }
        }
    }

    generateBoardCopy() {
        let boardCopy = new Board(this.game);
        boardCopy.width = this.width;
        boardCopy.height = this.height;
        boardCopy.init();

        for (let column=0; column<this.grid.length; column++) {
            for (let row=0; row<this.grid[column].length; row++) {
                let tile = this.getTileAt(column, row);
                if (tile) {
                    boardCopy.setTile(tile.tileId, column, row);
                }
            }
        }

        return boardCopy;
    }

    getActiveTransitions() {
        let activeTransition = [];
        this.grid.forEach((column) => {
            column.forEach((tile) => {
                if (tile && tile.currentTransition) {
                    activeTransition.push(tile.currentTransition);
                }
            });
        });
        return activeTransition;
    }

    playerCanMove() {
        return (this.currentTransitionFinishedTimeout == null && this.currentTransitionWaitInterval == null);
    }

    awaitActiveTransitions(callback, delay=0.25) {
        if (this.currentTransitionWaitInterval) {
            clearInterval(this.currentTransitionWaitInterval);
            clearTimeout(this.currentTransitionFinishedTimeout);
        }

        let that = this;
        this.currentTransitionWaitInterval = setInterval(() => {
            if (that.getActiveTransitions().length <= 0) {
                clearInterval(this.currentTransitionWaitInterval);
                if (!delay) {
                    this.currentTransitionWaitInterval = null;
                    this.currentTransitionFinishedTimeout = null;
                    callback();
                    return;
                }

                this.currentTransitionFinishedTimeout = setTimeout(() => {
                    this.currentTransitionFinishedTimeout = null;
                    this.currentTransitionWaitInterval = null;
                    callback();
                }, delay * 1000);
            }
        }, 10);
    }

    getTileAt(x, y) {
        if (!this.positionIsInBounds(x, y)) return undefined;

        return this.grid[x][y];
    }

    positionIsInBounds(x, y) {
        return (x >= 0 && y >= 0 && x < this.width && y < this.height);
    }

    getTilePositionFromMouse(mouse) {
        let rect = canvas.getBoundingClientRect();
        let x = Math.floor((mouse.clientX - rect.left) / this.game.style.tileWidth);
        let y = Math.floor((mouse.clientY - rect.top) / this.game.style.tileWidth);

        return [x, y];
    }

    setTile(tileId, x, y) {
        if (!this.positionIsInBounds(x, y)) return;

        let tile = new Tile(this.game, tileId, x, y)
        this.grid[x][y] = tile;
    }

    insertTileAt(tile, x, y) {
        this.grid[x][y] = tile;
    }

    removeTileAt(x, y) {
        if (!this.positionIsInBounds(x, y)) return;

        this.grid[x][y] = null;
    }

    moveTileAt(startX, startY, endX, endY) {
        let tile = this.getTileAt(startX, startY);
        if (!tile) return;

        tile.moveTo(endX, endY, this.game.style.transitionSpeed);
        this.removeTileAt(startX, startY);
        this.insertTileAt(tile, endX, endY);
    }

    dropTiles() {
        let tilesHaveDropped = false;
        let that = this;
        this.grid.forEach((column) => {
            let bottom = column.length-1;
            for (let tileIndex=column.length-1; tileIndex >= 0; tileIndex--) {
                let tile = column[tileIndex];
                if (tile) {
                    tilesHaveDropped = (tile.y != bottom || tilesHaveDropped);
                    this.moveTileAt(tile.x, tile.y, tile.x, bottom);
                    bottom--;
                }
            }
        });

        if (tilesHaveDropped) {
            // Wait for all tiles to be droped to try and clear
            this.awaitActiveTransitions(() => {
                //console.log('Returned');
                this.clearCombos();
            });
        }
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
                    if (currentComboList.length >= this.game.minCombo) {
                        combosFound.push([...currentComboList]);
                    }
                    currentComboList = [];
                    currentComboType = tile.tileId;
                    currentComboList.push(tile);
                }
            }
        });
        if (currentComboList.length >= this.game.minCombo) {
            combosFound.push(currentComboList);
        }

        return combosFound;
    }

    getAllCombos() {
        let that = this;
        let verticalCombos = [];
        let horizontalCombos = [];
        this.grid.forEach((column) => {
            verticalCombos = verticalCombos.concat(that.checkCombosInLine(column));
        });
        for (let rowIndex=0; rowIndex<this.height; rowIndex++) {
            let tilesInRow = [];
            for (let columnIndex=0; columnIndex<this.width; columnIndex++) {
                tilesInRow.push(this.getTileAt(columnIndex, rowIndex));
            }
            horizontalCombos = horizontalCombos.concat(that.checkCombosInLine(tilesInRow));
        }

        return [verticalCombos, horizontalCombos];
    }

    clearCombos() {
        let [verticalCombos, horizontalCombos] = this.getAllCombos();

        let that = this;
        verticalCombos.forEach((combo) => {
            that.breakCombo(combo);
        });
        horizontalCombos.forEach((combo) => {
            that.breakCombo(combo);
        });

        this.dropTiles();
    }

    switchTiles(x1, y1, x2, y2) {
        let tile1 = this.getTileAt(x1, y1);
        let tile2 = this.getTileAt(x2, y2);

        if (tile1) {
            tile1.moveTo(x2, y2, this.game.style.transitionSpeed);
        }
        if (tile2) {
            tile2.moveTo(x1, y1, this.game.style.transitionSpeed);
        }

        this.insertTileAt(tile2, x1, y1);
        this.insertTileAt(tile1, x2, y2);

        // Wait for the tiles being switched to finish their transitions
        this.awaitActiveTransitions(() => {
            this.clearCombos();
        });
    }

    render() {
        ctx.clearRect(0, 0, this.game.getWidth(), this.game.getHeight());

        ctx.fillStyle = this.game.style.borderColor

        for (let verticalLine=1; verticalLine<this.width; verticalLine++) {
            ctx.fillRect(verticalLine * this.game.style.tileWidth, 0, this.game.style.borderWidth, this.game.getHeight());
        }

        for (let horizontalLine=1; horizontalLine<this.height; horizontalLine++) {
            ctx.fillRect(0, horizontalLine * this.game.style.tileWidth, this.game.getWidth(), this.game.style.borderWidth);
        }

        this.grid.forEach((row) => {
            row.forEach((tile) => {
                if (tile) {
                    tile.render();
                }
            });
        });
    }
}
