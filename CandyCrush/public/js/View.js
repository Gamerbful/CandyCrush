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



        ///     Events & States     ///
        this.start = true;
        this.readyEvent = new Event();
        this.animationEnded = new Event();
        this.toAnimate = Array();
        this.currentGrid = null;
        this.state = "off"; // off : no animation / on : animation // resize : window resize


        ///     Sweets Sprites      ///
        this.spriteSheet = new Image;
        this.animationFrameRate = 50;
        this.sprites = { // coordinates of sweets type in our spriteSheet
            0: [1625, 0],
            1: [1298, 170],
            2: [1615, 310],
            3: [1450, 310],
            4: [1225, 0]
        };

    }

    init() {
        let that = this;
        this.spriteSheet.onload = () => {
            this.readyEvent.trigger();
            window.addEventListener('resize', function (event) {
                that.gs.width = Math.round(60 * window.innerWidth / 100);
                that.gs.height = Math.round(70 * window.innerHeight / 100);
                that.ctx = that.gs.getContext('2d');
                that.ctx.width = that.gs.width;
                that.ctx.height = that.gs.height;
                let previousState = this.state;
                that.state = "resize";
                that.drawGameScreen(that.currentGrid);
                that.state = previousState;
            });
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


        let stepWidth = 2 / 3 * this.ctx.width / n
        let stepHeight = this.ctx.height / m

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
                                let beginY = 0;
                                let step = coordY / 100
                                column.push({
                                    coord: [coord[0], coord[1]],
                                    from: [coordX, beginY],
                                    to: coordY,
                                    step: step
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
                    console.log(grid);
                    for (let i = 0; i < n; i++) {
                        for (let j = 0; j < m; j++) {
                            if (grid[i][j].state == "new") {
                                let coord = this.sprites[grid[i][j].type];
                                let coordX = Math.round((1 / 3 * this.ctx.width) + (j * stepWidth) + (stepWidth / 2) - ((this.ctx.width * 0.045) / 2));
                                let coordY = Math.round((i * stepHeight) + (stepHeight / 2) - ((this.ctx.height * 0.1) / 2));
                                let beginY = 0;
                                let step = coordY / 70;
                                this.toAnimate[i][j] = {
                                    coord: [coord[0], coord[1]],
                                    from: [coordX, beginY],
                                    to: coordY,
                                    step: step
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

    resizeSweet(stepWidth, stepHeight, n, m) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                if ( this.toAnimate[i][j] != null ){
                let coordX = Math.round((1 / 3 * this.ctx.width) + (j * stepWidth) + (stepWidth / 2) - ((this.ctx.width * 0.045) / 2));
                let coordY = Math.round((i * stepHeight) + (stepHeight / 2) - ((this.ctx.height * 0.1) / 2));
                this.toAnimate[i][j].from[0] = coordX;
                this.toAnimate[i][j].to = coordY;
            }
        }
        }
    }

    sweetExplosion( params ) {
        console.log(params[2]);
        let m = params[2].length;
        let n = params[2].length;
        let stepWidth = 2 / 3 * this.ctx.width / n;
        let stepHeight = this.ctx.height / m;
        for(let i = 0; i<params[2].length; i++){
            let hole = 0;
            for(let j = params[2].length -1; j>=0; j--){
                if ( params[1].some( (r) => r[0] == j && r[1] == i) ){
                    hole++;
                }
                else if ( hole > 0 ) {
                    let temp = this.toAnimate[j][i];
                    this.toAnimate[j][i] = null;
                    this.toAnimate[j+hole][i] = temp;

                    this.toAnimate[j+hole][i].to = Math.round(( (j+hole) * stepHeight) + (stepHeight / 2) - ((this.ctx.height * 0.1) / 2));
                    this.toAnimate[j+hole][i].step = (this.toAnimate[j+hole][i].to - this.toAnimate[j+hole][i].from[1]) / 70;
                    console.log(this.toAnimate[j+hole][i].step);
                    hole--;
                    
                }
            }

        setTimeout(
            () =>{
                this.drawGameScreen(params[2]);
            },2000
        );
        
       
    }
}


    sweetAppear(grid) {
        let offCount = 0;
        this.toAnimate.forEach ( (arr) => {
            arr.forEach( (sprite) => {
                if ( sprite == null){
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
                    let toY = this.toAnimate[i][j].to;
                    let step = this.toAnimate[i][j].step;
                    if (coordY < toY) {
                        this.toAnimate[i][j].from[1] = this.toAnimate[i][j].from[1] + step;

                    } else {
                        coordY = toY;
                        offCount++;
                        
                    }
                    this.ctx.drawImage(this.spriteSheet, textX, textY, 130, 150, coordX, coordY, this.ctx.width * 0.045, this.ctx.height * 0.1);


                }
            }
        }
        if ( offCount > (this.toAnimate.length * this.toAnimate.length) -2){
            this.state = "off";
        }
        if (this.state == "appear") {
            
            setTimeout(() => {
                this.drawGameScreen(grid);
                this.sweetAppear(grid);
            }, this.animationFrameRate);
        }
        else {
            this.animationEnded.trigger();
        }


    }

    drawGameScreen(grid) {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.ctx.width, this.ctx.height);
        this.drawDataArea();
        this.drawGameArea(grid);


    }
}