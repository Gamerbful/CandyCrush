// TODO:
// combo function
// score compute


import Event from './Event.js';

class Sweet {
    constructor() {
        this.type = Math.floor(Math.random() * 4);
    }
}


export default class Model {


    constructor() {
        this.drawEvent = new Event();
        this.explodeEvent = new Event();
        this.grid = null;
        this.n = 0;
        this.m = 0;
    }

    initGrid(n, m) {
        this.n = n;
        this.m = m;
        this.grid = Array(n).fill();
        this.grid = this.grid.map((value, idx) => {
            let rows = Array(m).fill();
            rows = rows.map((value, idx) => {
                return new Sweet();
            });
            return rows;
        });
        this.drawEvent.trigger(this.grid);
    }

    checkExplosion() {
        let explosion = this.explosion();
        explosion.forEach( (coord) => {
            this.grid[coord[0]][coord[1]] = new Sweet();
        });
        if ( explosion.length > 0 ){
        this.explodeEvent.trigger({1:explosion,2:this.grid});
        }
    }

    explosion() {
        let toRemove = Array();
        let checked = Array(this.n).fill();
        checked = checked.map((value, idx) => {
            let rows = Array(this.m).fill();
            rows = rows.map((value, idx) => {
                return 0;
            });
            return rows;
        });

        for (let i = 0; i < this.n; i++) {
            for (let j = 0; j < this.m; j++) {
                if (checked[i][j] != 1) {
                    checked[i][j] = 1;
                    let line = this.getLine(i, j);
                    let col = this.getColumn(i, j);
                    if (line.length >= 2 || col.length >= 2) {
                        toRemove.push([i, j]);
                        if (line.length >= 2) {
                            toRemove = toRemove.concat(line);
                            line.forEach((coord) => {
                                checked[coord[0]][coord[1]] = 1;
                            })
                        }
                        if (col.length >= 2) {
                            toRemove = toRemove.concat(col);
                            col.forEach((coord) => {
                                checked[coord[0]][coord[1]] = 1;
                            })
                        }
                    }
                }
            }
        }

        return toRemove;
    }


    getColumn(i, j) {
        let row = new Array();
        let step = 1;
        let type = this.grid[i][j].type;
        let up = true;
        let down = true;
        while (up || down) {

            if ((i + step < this.grid.length) && up) {
                let sweetR = this.grid[i + step][j];
                if (sweetR.type == type) {
                    row.push([i + step, j])
                } else {
                    up = false;
                }
            } else {
                up = false;
            }
            if ((i - step >= 0) && down) {
                let sweetL = this.grid[i - step][j];
                if (sweetL.type == type) {
                    row.push([i - step, j])
                } else {
                    down = false;
                }
            } else {
                down = false;
            }
            step++;
        }
        return row;
    }

    getLine(i, j) {

        let row = new Array();
        let step = 1;
        let type = this.grid[i][j].type;
        let right = true;
        let left = true;
        while (right || left) {

            if ((j + step < this.grid[0].length) && right) {
                let sweetR = this.grid[i][j + step];
                if (sweetR.type == type) {
                    row.push([i, j + step])
                } else {
                    right = false;
                }
            } else {
                right = false;
            }
            if ((j - step >= 0) && left) {
                let sweetL = this.grid[i][j - step];
                if (sweetL.type == type) {
                    row.push([i, j - step])
                } else {
                    left = false;
                }
            } else {
                left = false;
            }
            step++;

        }
        return row;
    }
}