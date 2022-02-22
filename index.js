

const gs = document.getElementById('gamescreen');
gs.width = 70* window.innerWidth / 100;
gs.height = 60 * window.innerHeight / 100;
const ctx = gs.getContext('2d');
ctx.width = gs.clientWidth;
ctx.height = gs.clientHeight;
ctx.font = "13px Arial";



/////       MODEL       //////

let buttons = [];
let pts = [];
let nbPts = 0;
let state = 'able';
let catSRC = './assets/chatmarche.png';

class Button {
    constructor(x, y, width, height, func) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.func = func;
    }
}

//  draw red buttons //

const drawButton = (color,x,y,width,height,text,func) =>{
    buttons.push(new Button(x,y,width,height,func));
    ctx.fillStyle = color;
    ctx.fillRect(x,y,width,height);
    ctx.fillStyle = 'black';  
    ctx.fillText(text, x + width/2 - ctx.measureText(text).width/2, height/2);
}

//  draw canvas and content inside  //



const drawPoints = () => {
    ctx.fillStyle = 'black';
    for (const pt of pts){
        ctx.fillRect(pt[0],pt[1],2,2);
    }
}
const drawLines = () => {
    ctx.strokeStyle = 'green';
    ctx.beginPath();
    for (const pt of pts){
        ctx.lineTo(pt[0], pt[1]);
    }
    ctx.stroke();
}

const drawGs = () =>{

    //  draw yellow canvas  //
    ctx.fillStyle = 'yellow';
    ctx.fillRect(0,0,ctx.width,ctx.height);
    
    drawLines();
    drawPoints();

}




const drawCat = (x,y) => {
    let cat = new Image();
    cat.src = catSRC;
    cat.onload = () =>{
        ctx.drawImage(cat,x-cat.width/2,y-cat.height/2);
    }
}

const drawCatToPointN = (n=0) => {
    let pt = pts[n];
    drawCat(pt[0],pt[1]);
}

const drawButtons = () =>{
    drawButton('red',20,0,120,40,'effacer',drawGs);
    drawButton('red',160,0,120,40,'ligne',drawLines);
    drawButton('red',300,0,120,40,'animation',catAnimation);
}

let animIdx = 0;

const catAnimation = () =>{
    switch (animIdx){
        case 0:
            var meow = new Audio('./assets/miaou.mp3')
            catSRC = './assets/chatmarche.png'
            meow.play();
            break;

        case pts.length-1:
            catSRC = './assets/chatdort.png'
            break;
            
    }
    if ( animIdx < pts.length){
        state = "animation";
        drawGs();
        drawButtons();
        drawCatToPointN(animIdx);
        animIdx +=1;
        setTimeout(catAnimation,500);
    }
    else{
        animIdx = 0;
        state = "able";
    }
}

drawGs();
drawButtons();





console.log(buttons);
const isInButtons = (x,y) => {
    const found = buttons.filter( btn => ( ( btn.x < x ) && ( btn.width+btn.x > x ) ) && ( ( btn.y < y ) && ( btn.height+btn.y > y ) ));
    return found;
}

/////       CONTROLEUR      /////

ctx.fillStyle = 'black';
const captureClickOnCanvas =  (event) => {
    // event.preventDefault();

    switch (state){
        case "able":
            if( event.target.offsetLeft == 0 ) return;

    
            var x = event.pageX - event.target.offsetLeft;
            var y = event.pageY - event.target.offsetTop;
            const found = isInButtons(x,y);
            if ( found.length != 0 ) {
                if (found[0].x == 20 ){
                    buttons = [];
                    pts = [];
                    nbPts = 0;
                    found[0].func();
                    drawButtons();
                }
                else{
                    found[0].func();
                }
            }
            else{
           
            pts.push([x,y]);
            nbPts += 1;
            console.log(`x= ${x} y= ${y} total= ${nbPts}`);
            console.log(pts);
            ctx.fillRect(x,y,2,2);
            }
            break;
        case "animation":
            console.log("en animation");
            break;
}

}

document.addEventListener('click', captureClickOnCanvas);