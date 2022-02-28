const gs = document.getElementById('gamescreen');

gs.width = Math.round(60* window.innerWidth / 100);
gs.height = Math.round(70 * window.innerHeight / 100);
const ctx = gs.getContext('2d');
ctx.width = gs.clientWidth;
ctx.height = gs.clientHeight;
ctx.font = "13px Arial";
ctx.lineWidth = 4;




/////       VIEW        /////


const spriteSheet = new Image;
spriteSheet.src = "./assets/spriteSheet.png";

spriteSheet.onload =  () => {
    ctx.drawImage(spriteSheet, 1625, 0, 110 + ctx, 150, 0, 0, ctx.width*0.045, ctx.height*0.1);
}



function drawDataArea(){
    ctx.fillStyle = '#F283B6';
    ctx.fillRect(0,0,1/3 * ctx.width,ctx.height); 
}
function drawGameArea(n,m){
    ctx.fillStyle = '#EDBFB7';
    
    ctx.fillRect(1/3 * ctx.width,0,2/3 * ctx.width,ctx.height);  

    ctx.strokeStyle = '#B5BFA1';
    stepWidth = 2/3 * ctx.width / n 
    stepHeight = ctx.height / m
    

    for ( var i = 1 ; i < n; i++ ){
        console.log(i);
        ctx.beginPath();
        ctx.moveTo(1/3 * ctx.width+i*stepWidth,0);
        ctx.lineTo(1/3 * ctx.width+i*stepWidth,ctx.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(1/3 * ctx.width,ctx.height - i*stepHeight);
        ctx.lineTo(ctx.width,ctx.height - i*stepHeight);
        ctx.stroke();

        
    }

    for ( let i = 0 ; i < n; i++ ){
        for ( let j = 0; j < m ; j++ ){
            console.log(ctx.height - j*stepHeight)
            ctx.drawImage(spriteSheet, 1625, 0, 110, 150, 1/3 * ctx.width+i*stepWidth + (stepWidth / 2) - (ctx.width*0.045 / 2), j*stepHeight + (stepHeight / 2) - (ctx.height*0.1 / 2), ctx.width*0.045, ctx.height*0.1);
        }

    }
  
    
}
function drawGameScreen(){
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,ctx.width,ctx.height);
    drawDataArea();
    drawGameArea(8,8);
    
}

drawGameScreen();



window.addEventListener('resize', function(event) {
    gs.width = Math.round(60* window.innerWidth / 100);
    gs.height = Math.round(70 * window.innerHeight / 100);
    const ctx = gs.getContext('2d');
    ctx.width = gs.clientWidth;
    ctx.height = gs.clientHeight;
    drawGameScreen();

}, true);
