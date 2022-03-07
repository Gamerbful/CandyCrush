import Event from './Event.js';

export default class View {
    constructor(id, width, height, font = "100% Karla") {

        ///     Canvas      ///
        this.gs = document.getElementById(id);
        this.gs.width = Math.round(width * window.innerWidth / 100);
        this.gs.height = Math.round(height * window.innerHeight / 100);
        this.ctx = this.gs.getContext('2d');
        this.ctx.width = this.gs.clientWidth;
        this.ctx.height = this.gs.clientHeight;
        this.ctx.font = font;
        this.ctx.lineWidth = 4;
        this.stepWidth = null;
        this.stepHeight = null;
        this.grd = this.ctx.createLinearGradient(0, 0, 200, 0);
        this.grd.addColorStop(0, "red");
        this.grd.addColorStop(1, "white");


        ///     Events & States     ///
        this.start = true;
        this.readyEvent = new Event();
        this.animationEnded = new Event();
        this.updateGrid = new Event();
        this.toAnimate = Array();
        this.currentGrid = null;
        this.state = "off"; // off : no animation / on : animation // resize : window resize
        this.buffer = new Array();


        ///     Sweets Sprites      ///
        this.spriteSheet = new Image;
        this.nbFrame = 60;
        this.animationFrameRate = 1000 / this.nbFrame;
        this.sprites = { // coordinates of sweets type in our spriteSheet
            0: [1625, 0],
            1: [1298, 170],
            2: [1615, 310],
            3: [1450, 310],
            4: [1225, 0]
        };

    }

    init() {
        this.gs.addEventListener('mousedown', (e) => {
            let {
                x,
                y
            } = this.getCursorPosition(this.gs, e);
            let {
                xIdx,
                yIdx
            } = this.isOnSweet(x, y);
            this.buffer = [xIdx, yIdx];
        })
        this.gs.addEventListener('mouseup', (e) => {
            let {
                x,
                y
            } = this.getCursorPosition(this.gs, e);
            let {
                xIdx,
                yIdx
            } = this.isOnSweet(x, y);
            this.swapSweet(this.buffer[0], this.buffer[1], xIdx, yIdx);
        })
        this.spriteSheet.onload = () => {
            this.readyEvent.trigger();
        }
        this.spriteSheet.src = "./assets/spriteSheet.png";
    }

    drawDataArea() {
        this.ctx.fillStyle = '#F283B6';
        this.ctx.fillRect(0, 0, 1 / 3 * this.ctx.width, this.ctx.height);
        this.ctx.fillStyle = '#FFFFFF';
        let text = "Score :";
        this.ctx.fillText(text, 1 / 3 * this.ctx.width / 2 - this.ctx.measureText(text).width / 2, Math.round(this.ctx.height * 0.2));
    }

    drawGameArea(grid) {
        this.currentGrid = grid;
        let n = grid.length;
        let m = grid[0].length;
        this.ctx.fillStyle = '#EDBFB7';

        this.ctx.fillRect(1 / 3 * this.ctx.width, 0, 2 / 3 * this.ctx.width, this.ctx.height);


        let stepWidth = 2 / 3 * this.ctx.width / n;
        let stepHeight = this.ctx.height / m;

        this.stepWidth = stepWidth;
        this.stepHeight = stepHeight;

        this.drawGrid(stepWidth, stepHeight, n);


        switch (this.state) {
            case "off":


                if (this.start) {
                    for (let i = 0; i < n; i++) {
                        let column = new Array();
                        for (let j = 0; j < m; j++) {
                            if (grid[i][j] != null) {
                                let coord = this.sprites[grid[i][j].type];
                                let coordX = Math.round((1 / 3 * this.ctx.width) + (j * stepWidth) + (stepWidth / 2) - ((this.ctx.width * 0.045) / 2));
                                let coordY = Math.round((i * stepHeight) + (stepHeight / 2) - ((this.ctx.height * 0.1) / 2));
                                let beginY = -(stepHeight + (stepHeight / 2) - ((this.ctx.height * 0.1) / 2));
                                let step = (coordY - beginY) / this.nbFrame;
                                column.push({
                                    coord: [coord[0], coord[1]],
                                    from: [coordX, beginY],
                                    to: [coordX, coordY],
                                    step: [0, step],
                                    dir: 0
                                });

                            } else {
                                column.push(null);
                            }
                        }
                        this.toAnimate.push(column);

                    }
                    this.start = false;
                    this.state = "appear";
                    this.sweetAppear(grid);
                } else {
                    this.state = "appear"
                    for (let i = 0; i < n; i++) {
                        for (let j = 0; j < m; j++) {
                            if (grid[i][j].state == "new") {
                                let coord = this.sprites[grid[i][j].type];
                                let coordX = Math.round((1 / 3 * this.ctx.width) + (j * stepWidth) + (stepWidth / 2) - ((this.ctx.width * 0.045) / 2));
                                let coordY = Math.round(((i) * stepHeight) + (stepHeight / 2) - ((this.ctx.height * 0.1) / 2));
                                let beginY = -(stepHeight + (stepHeight / 2) - ((this.ctx.height * 0.1) / 2));
                                let step = (coordY - beginY) / this.nbFrame;
                                this.toAnimate[i][j] = {
                                    coord: [coord[0], coord[1]],
                                    from: [coordX, beginY],
                                    to: [coordX, coordY],
                                    step: [0, step],
                                    dir: 0
                                };

                            }
                        }

                    }
                    this.sweetAppear(grid);
                }
                break;
            case "resize":
                this.resizeSweet(stepWidth, stepHeight, n, m);
                this.sweetAppear(grid);
                break;

        }

    }


    drawGrid(stepWidth, stepHeight, n) {
        this.ctx.strokeStyle = '#B5BFA1';
        for (var i = 1; i < n; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(1 / 3 * this.ctx.width + i * stepWidth, 0);
            this.ctx.lineTo(1 / 3 * this.ctx.width + i * stepWidth, this.ctx.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(1 / 3 * this.ctx.width, this.ctx.height - i * stepHeight);
            this.ctx.lineTo(this.ctx.width, this.ctx.height - i * stepHeight);
            this.ctx.stroke();
        }
    }



    sweetExplosion(params) {
        let m = params[2].length;
        let n = params[2].length;
        let stepHeight = this.ctx.height / m;
        for (let i = 0; i < params[2].length; i++) {
            let hole = 0;
            for (let j = params[2].length - 1; j >= 0; j--) {
                if (params[1].some((r) => r[0] == j && r[1] == i)) {
                    hole++;
                } else if (hole > 0) {
                    let temp = this.toAnimate[j][i];
                    this.toAnimate[j][i] = null;
                    this.toAnimate[j + hole][i] = temp;

                    this.toAnimate[j + hole][i].to = [this.toAnimate[j + hole][i].to[0], Math.round(((j + hole) * stepHeight) + (stepHeight / 2) - ((this.ctx.height * 0.1) / 2))];
                    this.toAnimate[j + hole][i].step[1] = (this.toAnimate[j + hole][i].to[1] - this.toAnimate[j + hole][i].from[1]) / this.nbFrame;


                }
            }

            setTimeout(
                () => {
                    this.drawGameScreen(params[2]);
                }, 50
            );


        }
    }


    sweetAppear(grid) {
        let offCount = 0;
        this.toAnimate.forEach((arr) => {
            arr.forEach((sprite) => {
                if (sprite == null) {
                    console
                    offCount++;
                }
            })

        });
        for (let i = 0; i < this.toAnimate.length; i++) {
            for (let j = 0; j < this.toAnimate.length; j++) {
                if (this.toAnimate[i][j] != null) {
                    let textX = this.toAnimate[i][j].coord[0];
                    let textY = this.toAnimate[i][j].coord[1];
                    let coordX = this.toAnimate[i][j].from[0];
                    let coordY = this.toAnimate[i][j].from[1];
                    let toX = this.toAnimate[i][j].to[0];
                    let toY = this.toAnimate[i][j].to[1];
                    let stepX = this.toAnimate[i][j].step[0];
                    let stepY = this.toAnimate[i][j].step[1];
                    let dir = this.toAnimate[i][j].dir;

                    switch (dir) {

                        case 0:
                            if (coordY < toY) {
                                this.toAnimate[i][j].from[1] = this.toAnimate[i][j].from[1] + stepY;

                            } else if (coordX < toX) {
                                this.toAnimate[i][j].from[0] = this.toAnimate[i][j].from[0] + stepX;
                            } else {
                                this.toAnimate[i][j].from[0] = toX;
                                this.toAnimate[i][j].from[1] = toY;
                                offCount++;
                            }
                            break;

                        case 1:
                            if (coordY > toY) {
                                this.toAnimate[i][j].from[1] = this.toAnimate[i][j].from[1] + stepY;

                            } else if (coordX > toX) {
                                this.toAnimate[i][j].from[0] = this.toAnimate[i][j].from[0] + stepX;
                            } else {
                                this.toAnimate[i][j].from[0] = toX;
                                this.toAnimate[i][j].from[1] = toY;
                                offCount++;
                            }


                    }


                    this.ctx.drawImage(this.spriteSheet, textX, textY, 130, 150, this.toAnimate[i][j].from[0], this.toAnimate[i][j].from[1], this.ctx.width * 0.045, this.ctx.height * 0.1);


                }
            }
        }
        if (offCount > (this.toAnimate.length * this.toAnimate.length) - 2) {
            this.state = "off";
            console.log(this.toAnimate);
            console.log("FINITO");
        }
        if (this.state == "appear") {

            setTimeout(() => {
                this.drawGameScreen(grid);
                this.sweetAppear(grid);
            }, this.animationFrameRate);
        } else {
            this.animationEnded.trigger();
        }


    }

    drawGameScreen(grid) {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.ctx.width, this.ctx.height);
        this.drawDataArea();
        this.drawGameArea(grid);


    }


    getCursorPosition(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        console.log("x: " + x + " y: " + y);
        return {
            x,
            y
        };
    }



    isOnSweet(x, y) {

        let xIdx = null;
        let yIdx = null;
        if (x > (1 / 3 * this.ctx.width)) {
            yIdx = Math.floor((x - (1 / 3 * this.ctx.width)) / this.stepWidth);
            xIdx = Math.floor(y / this.stepHeight);
            return {
                xIdx,
                yIdx
            };
        } else {
            return null;
        }


    }

    swapSweet(x1, y1, x2, y2) {

        if ( this.state == "off" ){
        let s1Coord = this.toAnimate[x1][y1].from.map((val) => val);
        let s2Coord = this.toAnimate[x2][y2].from.map((val) => val);

        console.log(s1Coord);

        console.log(s2Coord);
        let diffWidth = y1 - y2;
        let diffHeight = x1 - x2;
        let tempGrid = this.currentGrid[x1][y1];
        let stepHeight = Math.sqrt(Math.pow(s2Coord[1] - s1Coord[1], 2)) / this.nbFrame;

        let stepWidth = Math.sqrt(Math.pow(s2Coord[0] - s1Coord[0], 2)) / this.nbFrame;
        if (diffWidth == -1) {
            this.toAnimate[x1][y1].to[0] = s2Coord[0];
            this.toAnimate[x2][y2].to[0] = s1Coord[0];
            this.toAnimate[x1][y1].step[0] = stepWidth;
            this.toAnimate[x2][y2].step[0] = -stepWidth;
            this.toAnimate[x1][y1].dir = 0;
            this.toAnimate[x2][y2].dir = 1;

            
            this.currentGrid[x1][y1] =  this.currentGrid[x2][y2];
            this.currentGrid[x2][y2] = tempGrid;
            let temp = JSON.parse(JSON.stringify(this.toAnimate[x1][y1]));
            this.toAnimate[x1][y1] = JSON.parse(JSON.stringify(this.toAnimate[x2][y2]));
            this.toAnimate[x2][y2] = temp;
            console.log(this.toAnimate[x1][y1], this.toAnimate[x2][y2]);

        } else if (diffWidth == 1) {
            this.toAnimate[x1][y1].to[0] = s2Coord[0];
            this.toAnimate[x2][y2].to[0] = s1Coord[0];
            this.toAnimate[x1][y1].step[0] = -stepWidth;
            this.toAnimate[x2][y2].step[0] = stepWidth;
            this.toAnimate[x1][y1].dir = 1;
            this.toAnimate[x2][y2].dir = 0;
            this.currentGrid[x1][y1] =  this.currentGrid[x2][y2];
            this.currentGrid[x2][y2] = tempGrid;
            let temp = JSON.parse(JSON.stringify(this.toAnimate[x1][y1]));
            this.toAnimate[x1][y1] = JSON.parse(JSON.stringify(this.toAnimate[x2][y2]));
            this.toAnimate[x2][y2] = temp;
            console.log(this.toAnimate[x1][y1], this.toAnimate[x2][y2]);
        } else if (diffHeight == 1) {
            this.toAnimate[x1][y1].to[1] = s2Coord[1];
            this.toAnimate[x2][y2].to[1] = s1Coord[1];
            this.toAnimate[x1][y1].step[1] = -stepHeight;
            this.toAnimate[x2][y2].step[1] = stepHeight;
            this.toAnimate[x1][y1].dir = 1;
            this.toAnimate[x2][y2].dir = 0;
            this.currentGrid[x1][y1] =  this.currentGrid[x2][y2];
            this.currentGrid[x2][y2] = tempGrid;
            let temp = JSON.parse(JSON.stringify(this.toAnimate[x1][y1]));
            this.toAnimate[x1][y1] = JSON.parse(JSON.stringify(this.toAnimate[x2][y2]));
            this.toAnimate[x2][y2] = temp;
            console.log(this.toAnimate[x1][y1], this.toAnimate[x2][y2]);
        } else if (diffHeight == -1) {
            this.toAnimate[x1][y1].to[1] = s2Coord[1];
            this.toAnimate[x2][y2].to[1] = s1Coord[1];
            this.toAnimate[x1][y1].step[1] = stepHeight;
            this.toAnimate[x2][y2].step[1] = -stepHeight;
            this.toAnimate[x1][y1].dir = 0;
            this.toAnimate[x2][y2].dir = 1;
            this.currentGrid[x1][y1] =  this.currentGrid[x2][y2];
            this.currentGrid[x2][y2] = tempGrid;
            let temp = JSON.parse(JSON.stringify(this.toAnimate[x1][y1]));
            this.toAnimate[x1][y1] = JSON.parse(JSON.stringify(this.toAnimate[x2][y2]));
            this.toAnimate[x2][y2] = temp;
            console.log(this.toAnimate[x1][y1], this.toAnimate[x2][y2]);
            
        }
        this.updateGrid.trigger(this.currentGrid);
        this.drawGameScreen(this.currentGrid);
    }
}
}