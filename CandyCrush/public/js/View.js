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
        this.toAnimate = new Array();
        this.currentGrid = null;
        this.state = "off"; // off : no animation / on : animation // resize : window resize


        ///     Sweets Sprites      ///
        this.spriteSheet = new Image;
        this.animationFrameRate = 6;
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
                that.ctx.width = that.gs.width * window.devicePixelRatio;
                that.ctx.height = that.gs.height * window.devicePixelRatio;
                let previousState = this.state;
                that.state = "resize";
                that.drawGameScreen(that.currentGrid);
                for (const sweet of that.toAnimate) {
                    that.ctx.drawImage(that.spriteSheet, sweet.coord[0], sweet.coord[1], 130, 150, sweet.from[0], sweet.to, that.ctx.width * 0.045, that.ctx.height * 0.1);
                }
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
        this.ctx.fillText(text,1 / 3 * this.ctx.width / 2 - this.ctx.measureText(text).width/2,Math.round(this.ctx.height * 0.2));
    }

    drawGameArea(grid) {
        console.log(this.state);
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
                this.toAnimate = new Array();

                for (let i = 0; i < n; i++) {
                    for (let j = 0; j < m; j++) {

                        let coord = this.sprites[grid[i][j].type];
                        let coordX = Math.round((1 / 3 * this.ctx.width) + (i * stepWidth) + (stepWidth / 2) - ((this.ctx.width * 0.045) / 2));
                        let coordY = Math.round((j * stepHeight) + (stepHeight / 2) - ((this.ctx.height * 0.1) / 2));
                        let beginY = 0;
                        let step = coordY / 70
                        this.toAnimate.push({
                            coord: [coord[0], coord[1]],
                            from: [coordX, beginY],
                            to: coordY,
                            step: step
                        });

                    }
                    if (this.start) {
                        this.start = false;
                        this.state = "on";
                        this.sweetAppear(grid);
                    }
                }
                break;
            case "resize":
                this.resizeSweet(stepWidth, stepHeight, n, m);
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
        let idx = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                let coordX = Math.round((1 / 3 * this.ctx.width) + (i * stepWidth) + (stepWidth / 2) - ((this.ctx.width * 0.045) / 2));
                let coordY = Math.round((j * stepHeight) + (stepHeight / 2) - ((this.ctx.height * 0.1) / 2));
                this.toAnimate[idx].from[0] = coordX;
                this.toAnimate[idx].to = coordY;
                idx++;
            }
        }
    }

    sweetAppear(grid) {
        console.log(this.state);
        for (let i = this.toAnimate.length - 1; i >= 0; i--) {
            let textX = this.toAnimate[i].coord[0];
            let textY = this.toAnimate[i].coord[1];
            let coordX = this.toAnimate[i].from[0];
            let coordY = this.toAnimate[i].from[1];
            let toY = this.toAnimate[i].to;
            let step = this.toAnimate[i].step;
            if (coordY < toY) {
                this.toAnimate[i].from[1] = this.toAnimate[i].from[1] + step;
            } else {
                coordY = toY;
                this.state = "off";
            }
            this.ctx.drawImage(this.spriteSheet, textX, textY, 130, 150, coordX, coordY, this.ctx.width * 0.045, this.ctx.height * 0.1);


        }
        if (this.state == "on") {

            setTimeout(() => {
                this.drawGameScreen(grid);
                this.sweetAppear(grid);
            }, this.animationFrameRate);
        }


    }

    drawGameScreen(grid) {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.ctx.width, this.ctx.height);
        this.drawDataArea();
        this.drawGameArea(grid);


    }
}