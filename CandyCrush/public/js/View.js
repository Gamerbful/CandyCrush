
import Event from './Event.js';

export default class View {
    constructor(id, width, height, font = "13px Arial") {

        this.gs = document.getElementById(id);
        this.gs.width = Math.round(width * window.innerWidth / 100);
        this.gs.height = Math.round(height * window.innerHeight / 100);
        this.ctx = this.gs.getContext('2d');
        this.ctx.width = this.gs.clientWidth;
        this.ctx.height = this.gs.clientHeight;
        this.ctx.font = font;
        this.ctx.lineWidth = 4;
        this.spriteSheet = new Image;
        
        this.readyEvent = new Event();


        this.sprites = {
            0:[1625,0],
            1:[1298,170],
            2:[1615,310],
            3:[1450,310],
            4:[1225,0],
        }

        
    }

    init(){
        
        this.spriteSheet.onload =  () => {
            this.readyEvent.trigger();
        }
        this.spriteSheet.src = "./assets/spriteSheet.png";

    }
    drawDataArea() {
        this.ctx.fillStyle = '#F283B6';
        this.ctx.fillRect(0, 0, 1 / 3 * this.ctx.width, this.ctx.height);
    }

    drawGameArea(grid) {
        let n = grid.length;
        let m = grid[0].length;
        this.ctx.fillStyle = '#EDBFB7';

        this.ctx.fillRect(1 / 3 * this.ctx.width, 0, 2 / 3 * this.ctx.width, this.ctx.height);

        this.ctx.strokeStyle = '#B5BFA1';
        let stepWidth = 2 / 3 * this.ctx.width / n
        let stepHeight = this.ctx.height / m


        for (var i = 1; i < n; i++) {
            console.log(i);
            this.ctx.beginPath();
            this.ctx.moveTo(1 / 3 * this.ctx.width + i * stepWidth, 0);
            this.ctx.lineTo(1 / 3 * this.ctx.width + i * stepWidth, this.ctx.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(1 / 3 * this.ctx.width, this.ctx.height - i * stepHeight);
            this.ctx.lineTo(this.ctx.width, this.ctx.height - i * stepHeight);
            this.ctx.stroke();


        }

        for (let i = 0; i < n; i++) {
            for (let j = 0; j < m; j++) {
                let coord = this.sprites[grid[i][j].type]
                let step = j * stepHeight / 30;
                this.sweetAppear(coord[0],coord[1],i,j,stepWidth,stepHeight,step,0);
                
            }

        }
    }


    sweetAppear(x,y,i,j,stepWidth,stepHeight,step,idx) {
        
        this.ctx.drawImage(this.spriteSheet, x, y, 130, 150, 1 / 3 * this.ctx.width + i * stepWidth + (stepWidth / 2) - (this.ctx.width * 0.045 / 2), idx * step + (stepHeight / 2) - (this.ctx.height * 0.1 / 2), this.ctx.width * 0.045, this.ctx.height * 0.1);
        if ( idx * step < j * stepHeight){
            idx += 1;

            setTimeout( this.sweetAppear(x,y,i,j,stepWidth,stepHeight,step,idx), 50);
        }


    }

    drawGameScreen(grid) {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.ctx.width, this.ctx.height);
        this.drawDataArea();
        this.drawGameArea(grid);


    }
}