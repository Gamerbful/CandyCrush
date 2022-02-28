
import Controller from "./Controller.js";


const app = new Controller('gamescreen', 60, 70);


window.addEventListener('resize', function(event) {
    app.view.gs.width = Math.round(60* window.innerWidth / 100);
    app.view.gs.height = Math.round(70 * window.innerHeight / 100);
    app.view.ctx = app.view.gs.getContext('2d');
    app.view.ctx.width = app.view.gs.clientWidth;
    app.view.ctx.height =app.view.gs.clientHeight;
    app.view.drawGameScreen(app.model.grid);

}, true);


var audio = new Audio('../assets/mainTheme.mp3');
var audioOn = false;
document.getElementById('son').onclick = () => {
    if (!audioOn){
    audio.volume = 0.2
    audio.play();
    audioOn = true;
    }
    else {
        audio.pause();
        audioOn = false;
    }
}
audio.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);