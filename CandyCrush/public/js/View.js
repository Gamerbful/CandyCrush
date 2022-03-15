import Event from './Event.js';



export default class View {
    constructor(id, width, height,n,m, font = "2em Karla") {

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
        this.n = n;
        this.m = m;


        ///     Events & States     ///
        this.start = true;
        this.readyEvent = new Event();
        this.animationEnded = new Event();
        this.updateGrid = new Event();
        this.toAnimate = Array();
        this.currentGrid = null;
        this.state = "off"; // off : no animation / on : animation // resize : window resize
        this.buffer = new Array();
        this.score = 0;
        this.nbCoups = 20;

        ///     Sweets Sprites      ///
        this.skin = 0;
        this.spriteSheet = new Image;
        this.spriteSheet2 = new Image;
        this.spriteSheets = [this.spriteSheet, this.spriteSheet2];
        this.candyMeow = new Image;
        this.nbFrame = 120;
        this.animationFrameRate = 700 / this.nbFrame;
        this.sprites = { // coordinates of sweets type in our spriteSheet
            0: [1625, 0],
            1: [1298, 170],
            2: [1615, 310],
            3: [1450, 310],
            4: [1225, 0]
        };

        ///     Handlings game      ////
        this.lastMove = null;
        this.audios = {
            0: [ new Audio("./assets/fall1.mp3"),new Audio("./assets/fall2.mp3"),new Audio("./assets/fall3.mp3"),new Audio("./assets/fall4.mp3")],
            1: [ new Audio("./assets/melanchon.mp3"),new Audio("./assets/marine.mp3"),new Audio("./assets/zemmour.mp3"),new Audio("./assets/macron.mp3")]
        }

    }



    /**
     * 
     * 
     */
    init() {

        this.toAnimate = Array(this.n).fill();
        this.toAnimate = this.toAnimate.map((value, idx) => {
            let rows = Array(this.m).fill();
            rows = rows.map((value, idx) => {
                return null;
            });
            return rows;
        });
        
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
            this.swapSweet(this.buffer[0], this.buffer[1], xIdx, yIdx,true);
        })
        let nbImageLoaded = 0;
        const ready = () => {
            nbImageLoaded ++;
            if ( nbImageLoaded == 3 ){
                this.readyEvent.trigger({1:this.n,2:this.m});
            }
        }
        this.spriteSheet.onload = () => {    
            ready();
        }
        this.spriteSheet2.onload = () => {    
            ready();
        }
        this.candyMeow.onload = () => {
            ready();
        }
        this.spriteSheet2.src = "./assets/spriteSheet2.png"
        this.spriteSheet.src = "./assets/spriteSheet.png";
        this.candyMeow.src = "./assets/scoreKawaii.png";
    }


    writeText(text, color, yP,align,font) {
        this.ctx.font = font;
        let x,y = null;
        const coord = {
            "left": () => {
                x = 1 / 3 * this.ctx.width / 4 - this.ctx.measureText(text).width / 2;
                y = Math.round(this.ctx.height * yP);
            },
            "center": () => {
                x = 1 / 3 * this.ctx.width / 2 - this.ctx.measureText(text).width / 2;
                y = Math.round(this.ctx.height * yP);
            },
            "right": () => {
                x = 1 / 3 * this.ctx.width / 1.5 - this.ctx.measureText(text).width / 2;
                y = Math.round(this.ctx.height * yP);
            }
        }
        coord[align]();
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x,y );
    }
    drawDataArea() {
        this.ctx.fillStyle = '#F283B6';
        this.ctx.fillRect(0, 0, 1 / 3 * this.ctx.width, this.ctx.height);
        this.ctx.drawImage(this.candyMeow,Math.round(this.ctx.width*(1/3)) /6 - (this.candyMeow.width*0.3)/2,this.ctx.height*0.5,this.candyMeow.width*0.5,this.candyMeow.height*0.5);

        this.writeText("Score :", '#FFFFFF', 0.2,"center","2em Karla");
        this.writeText(this.score, '#000000', 0.3,"center","2em Karla");

        this.writeText("Coups restants:", '#FFFFFF', 0.6,"right","1em Karla");
        this.writeText(this.nbCoups, '#000000', 0.7,"right","2em Karla");
        

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
                this.state = "appear";
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
                if (this.lastMove != null) {
                    this.nbCoups--;
                    this.lastMove = null;
                }

                params[4].forEach( (type) => {
                    this.audios[this.skin][type].play();
                })
            setTimeout(
                () => {
                    this.drawGameScreen(params[2]);
                }, 50
            );
            if ( !this.start ) this.score = params[3];


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
                                this.toAnimate[i][j].dir = 0;
                                offCount++;
                            }


                    }


                    this.ctx.drawImage(this.spriteSheets[this.skin], textX, textY, 130, 150, this.toAnimate[i][j].from[0], this.toAnimate[i][j].from[1], this.ctx.width * 0.045, this.ctx.height * 0.1);


                }
            }
        }
        if (offCount > (this.toAnimate.length * this.toAnimate.length) - 2) this.state = "off";
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


    swapping(x1, y1, x2, y2, where, reverse) {

        if ( reverse ) this.lastMove = [x1, y1, x2, y2];
        let s1Coord = this.toAnimate[x1][y1].from.map((val) => val);
        let s2Coord = this.toAnimate[x2][y2].from.map((val) => val);

        let dir1, dir2, step1, step2, idx = null;
        let tempGrid = JSON.parse(JSON.stringify(this.currentGrid[x1][y1]));
        let stepHeight = Math.sqrt(Math.pow(s2Coord[1] - s1Coord[1], 2)) / (this.nbFrame / 2);

        let stepWidth = Math.sqrt(Math.pow(s2Coord[0] - s1Coord[0], 2)) / (this.nbFrame / 2);

        let check = {
            "0,1": () => {
                dir1 = 1;
                dir2 = 0;
                step1 = -stepHeight;
                step2 = stepHeight;
                idx = 1;
            },
            "0,-1": () => {
                dir1 = 0;
                dir2 = 1;
                step1 = stepHeight;
                step2 = -stepHeight;
                idx = 1;
            },
            "1,0": () => {
                dir1 = 1;
                dir2 = 0;
                step1 = -stepWidth;
                step2 = stepWidth;
                idx = 0;
            },
            "-1,0": () => {
                dir1 = 0;
                dir2 = 1;
                step1 = stepWidth;
                step2 = -stepWidth;
                idx = 0;
            }
        }
        check[where.toString()]();

        this.toAnimate[x1][y1].to[idx] = s2Coord[idx];
        this.toAnimate[x2][y2].to[idx] = s1Coord[idx];
        this.toAnimate[x1][y1].step[idx] = step1
        this.toAnimate[x2][y2].step[idx] = step2
        this.toAnimate[x1][y1].dir = dir1;
        this.toAnimate[x2][y2].dir = dir2;

        this.currentGrid[x1][y1] = JSON.parse(JSON.stringify(this.currentGrid[x2][y2]));
        this.currentGrid[x2][y2] = tempGrid;
        let temp = JSON.parse(JSON.stringify(this.toAnimate[x1][y1]));
        this.toAnimate[x1][y1] = JSON.parse(JSON.stringify(this.toAnimate[x2][y2]));
        this.toAnimate[x2][y2] = temp;
    }

    swapSweet(x1, y1, x2, y2,reverse) {

        if (this.state == "off") {
            let diffWidth = y1 - y2;
            let diffHeight = x1 - x2;
            this.swapping(x1, y1, x2, y2, [diffWidth, diffHeight],reverse);
            this.updateGrid.trigger(this.currentGrid);
            this.drawGameScreen(this.currentGrid);
        }
  
    }

    cancelMove() {
        if ( this.start ) this.start = false;
        if (this.lastMove != null) {
            let [x1, y1, x2, y2] = this.lastMove;
            this.swapSweet(x1, y1, x2, y2,false);
            this.lastMove = null;
        }
    }
}
